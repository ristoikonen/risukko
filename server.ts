import { createElement } from "react";
import { renderToString } from "react-dom/server";
import sharp from "sharp";
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import indexform from "./src/indexform";
import { checkIdentifierExists, storeIdentifier } from "@/storage"; "./src/storage";
import { Gf28Matrix8x8Engine, processPixelArray } from "./Gf88Matrix8x8Engine";

const PORT = Number(Bun.env.PORT) || 3000;
const IS_PROD = Bun.env.NODE_ENV === 'production';

interface OksaUniversalParams {
  name: string;
  canvasSize: number;
  padding: number;
  variant: number; // 0x02 = 3D Volumetric
  style: number;   // 0x01 = Sine Wave, 0x02 = Spiral Lattice, etc.
}

// Compact 14-byte ID decoder
function decodeUniversalId(id: string): OksaUniversalParams {
  let base64 = id.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binaryString = atob(base64);
  const buffer = new Uint8Array(14);
  for (let i = 0; i < 14 && i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  const nameBytes = buffer.subarray(0, 9);
  const actualLength = nameBytes.indexOf(0);
  const name = new TextDecoder().decode(actualLength === -1 ? nameBytes : nameBytes.subarray(0, actualLength));

  const view = new DataView(buffer.buffer);
  const canvasSize = view.getUint16(9);
  const padding = view.getUint8(11);
  const variant = buffer[12] || 0;
  const style = buffer[13] || 0;

  return { name, canvasSize, padding, variant, style };
}


// Global CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to return responses with CORS guaranteed
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

(async function main() {

    //await mkdir(imageDir, { recursive: true });

    //const port = Number(Bun.env.APP_PORT ?? 3000);
    //const host = Bun.env.APP_HOST ?? "localhost";

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Handle preflight OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }


try {

  if (url.pathname === '/form') {
    const html = renderToString(createElement(indexform));
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
    
    if (url.pathname === '/api/check-exists') {

        const name = url.searchParams.get('name') || '';
        const idQuery = url.searchParams.get('id') || '';
        console.log(`[API] Checking existence for name/id: ${name} ${idQuery || name}`);

        // TODO: Connect to Cloudflare R2 / Backblaze B2 to verify if prefix/key exists
              
          
          // If checking by universal ID or name key
          const exists = idQuery ? await checkIdentifierExists(idQuery) : false;
          
          return jsonResponse({ exists });

      }


      // Generate universal 2-way ID & register in storage
      if (url.pathname === '/api/generate' && req.method === 'POST') {
        const body = await req.json() as { 
          name: string; 
          canvasSize?: number; 
          padding?: number; 
          variant?: number; 
          style?: number 
        };
        
        //console.log(body);

        const cleanName = (body.name || 'OKSA').slice(0, 9);
        const canvasSize = body.canvasSize || 512;
        const padding = body.padding || 32;
        const variant = body.variant || 0x02; 
        const style = body.style || 0x01;     

        // Pack into 14-byte binary buffer
        const encoder = new TextEncoder();
        const nameBytes = encoder.encode(cleanName);
        
        const buffer = new Uint8Array(14);
        buffer.set(nameBytes, 0);

        console.log(buffer);
        
        const view = new DataView(buffer.buffer);
        view.setUint16(9, canvasSize);
        view.setUint8(11, padding);
        buffer[12] = variant;
        buffer[13] = style;

        let binaryString = "";
        for (let i = 0; i < buffer.length; i++) {
          binaryString += String.fromCharCode(buffer[i] || 0);
        }
        console.log(binaryString);
        
        // Base64URL encode to form the universal 2-way ID
        const universalId = btoa(binaryString)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

          // Persist the 14-byte packet directly into Cloudflare R2
          await storeIdentifier(universalId, buffer);
          console.log(`[API] Stored new identifier in R2: ${universalId}`)

        return jsonResponse({ success: true, universalId });
      }

    if ((url.pathname === "/api/encrypt" || url.pathname === "/api/decrypt") && req.method === "POST") {
      try {
        const mode = url.pathname === "/api/encrypt" ? "enc" : "dec";
        const arrayBuffer = await req.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        if (inputBuffer.length === 0) {
          return new Response("No image payload received", { status: 400 });
        }

        // 1. Force image into standard RGBA structure and extract raw pixel bytes
        const imagePipeline = sharp(inputBuffer);
        const metadata = await imagePipeline.metadata();
        
        const { data: rawPixels, info } = await imagePipeline
          .ensureAlpha() // Force 4 channels (RGBA) consistently
          .raw()
          .toBuffer({ resolveWithObject: true }); //

        // 2. Encrypt/Decrypt the pure RGBA stream using your 8-byte matrix math block
        const processedPixels = processPixelArray(rawPixels, mode);

        // 3. Package pixel data back into a valid container structure using sharp
        const outputImageBuffer = await sharp(processedPixels, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4,
          },
        })
          .png() // Force output as an openable PNG container
          .toBuffer();

        return new Response(outputImageBuffer, {
          headers: { "Content-Type": "image/png" },
        });

      } catch (err: any) {
        return new Response(`Processing Error: ${err.message}`, { status: 500 });
      }
    }

      return new Response("Oksa Engine API Server Active (risukko.com)", { 
        status: 200, 
        headers: corsHeaders 
      });

    } catch (e : any) {
      
      console.error(`[API Error Details]`, e.name, e.message, e.$metadata);
      return jsonResponse({ error: "Internal Server Error", details: e.message }, 500);
    }
  },
});

console.log(`🚀 Bun server running at http://localhost:${PORT}`);

    //console.log(`Bun server listening on http://${server.hostname}:${server.port}`);
})().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
