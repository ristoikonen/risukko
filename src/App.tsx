import React, { useState, useEffect } from 'react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Form State
  const [name, setName] = useState<string>('');
  const [styleSlot, setStyleSlot] = useState<string>('0x01'); // 3D Styles listbox
  const [existsWarning, setExistsWarning] = useState<boolean>(false);
  const [generatedId, setGeneratedId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Simulated Google Sign-In via Bun / IAP flow
  const handleGoogleLogin = () => {
    // In production, trigger Google OAuth redirect or IAP token fetch
    setIsAuthenticated(true);
    setUserEmail('risto@risukko.com');
  };

  // Check if name already exists as user types
  useEffect(() => {
    if (!name.trim()) {
      setExistsWarning(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/check-exists?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        setExistsWarning(data.exists);
      } catch {
        setExistsWarning(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [name]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.slice(0, 9),
          canvasSize: 512,
          padding: 32,
          variant: 0x02, // 3D Volumetric
          style: parseInt(styleSlot, 16),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedId(data.universalId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 font-sans text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center">
          <h1 className="text-3xl font-bold tracking-wider text-sky-400 mb-2">OKSA MATRIX</h1>
          <p className="text-sm text-slate-400 mb-8">risukko.com secure volumetric portal</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 font-sans text-slate-100 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <span className="text-sm font-mono text-sky-400">OKSA // risukko.com</span>
          <span className="text-xs text-slate-400">{userEmail}</span>
        </div>



<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 320" width="100%" height="100%">
  <rect width="1100" height="320" fill="#FFFFFF" />
  <defs>
    <g id="ap">
      <circle cx="0" cy="0" r="5.5" fill="#E67E22" stroke="#B95C00" stroke-width="1.5" />
      <circle cx="0" cy="0" r="2.2" fill="#F39C12" />
    </g>
    <g id="cp">
      <circle cx="0" cy="0" r="4.5" fill="#2980B9" stroke="#1F618D" stroke-width="1.2" />
      <circle cx="0" cy="0" r="1.8" fill="#A9CCE3" />
    </g>
    <g id="np">
      <circle cx="0" cy="0" r="4" fill="#223C5B" stroke="#38577B" stroke-width="1.2" />
      <circle cx="0" cy="0" r="1.5" fill="#7FB3D5" />
    </g>
  </defs>
<style
  dangerouslySetInnerHTML={{
    __html: `
      .gl { stroke: #E5E8E8; stroke-width: 1px; stroke-dasharray: 4,4; fill: none; }
      .or { stroke: #223C5B; stroke-width: 3.5px; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .is { stroke: #38577B; stroke-width: 2.2px; stroke-dasharray: 6,5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .cs { stroke: #2980B9; stroke-width: 1.4px; stroke-dasharray: 3,3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .ct { stroke: #E67E22; stroke-width: 1.8px; stroke-linecap: round; fill: none; }
    `,
  }}
/>

  <g className="gl">
    <line x1="30" y1="80" x2="1070" y2="80" />
    <line x1="30" y1="145" x2="1070" y2="145" />
    <line x1="30" y1="215" x2="1070" y2="215" />
    <circle cx="115" cy="145" r="45" />
    <circle cx="615" cy="145" r="65" />
    <circle cx="740" cy="145" r="65" />
    <circle cx="985" cy="145" r="55" />
  </g>

  <g transform="translate(60,65)">
    <path d="M25,80 L25,150" className="or" />
    <path d="M25,80 L25,150" className="is" />

    <path d="M25,95 L45,80 L75,80 L95,95" className="or" />
    <path d="M25,95 L45,80 L75,80 L95,95" className="is" />
    <line x1="25" y1="95" x2="45" y2="80" className="ct" />
    <use href="#ap" x="25" y="80" />

    <use href="#ap" x="25" y="150" />

    <use href="#np" x="75" y="80" />
    <use href="#ap" x="95" y="95" />
  </g>

  <g transform="translate(195,65)">
    <polygon points="25,25 35,35 25,45 15,35" className="or" />
    <polygon points="25,28 32,35 25,42 18,35" className="is" />
    <use href="#ap" x="25" y="35" />
    <path d="M25,80 L25,150" className="or" />
    <path d="M25,80 L25,150" className="is" />


    <use href="#np" x="25" y="115" />
    <use href="#ap" x="25" y="150" />
  </g>

  <g transform="translate(290,65)">
    <path d="M90,92 L72,80 L40,80 L24,96 L36,112 L74,118 L88,134 L72,150 L38,150 L20,138" className="or" />
    <path d="M90,92 L72,80 L40,80 L24,96 L36,112 L74,118 L88,134 L72,150 L38,150 L20,138" className="is" />

    <use href="#ap" x="90" y="92" />
    <use href="#np" x="72" y="80" />

    <use href="#ap" x="24" y="96" />

    <use href="#ap" x="88" y="134" />
    <use href="#np" x="72" y="150" />

    <use href="#ap" x="20" y="138" />
  </g>

  <g transform="translate(435,65)">
    <path d="M22,80 L22,130 L38,148 L74,148 L90,130 L90,80" className="or" />
    <path d="M22,80 L22,130 L38,148 L74,148 L90,130 L90,80" className="is" />

    <path d="M90,125 L90,150" className="or" />
    <use href="#ap" x="22" y="80" />
    <use href="#np" x="22" y="130" />

    <use href="#np" x="90" y="130" />
    <use href="#ap" x="90" y="80" />
    <use href="#ap" x="90" y="150" />
  </g>

  <g transform="translate(570,65)">
    <path d="M22,25 L22,150" className="or" />
    <path d="M22,25 L22,150" className="is" />

    <path d="M22,110 L52,95 L85,80" className="or" />
    <path d="M22,110 L52,95 L85,80" className="is" />
    <path d="M44,100 L88,150" className="or" />
    <path d="M44,100 L88,150" className="is" />
    <use href="#ap" x="22" y="25" />

    <use href="#ap" x="22" y="110" />
    <use href="#ap" x="22" y="150" />
    <use href="#np" x="52" y="95" />
    <use href="#ap" x="85" y="80" />
    <use href="#ap" x="88" y="150" />
  </g>

  <g transform="translate(695,65)">
    <path d="M22,25 L22,150" className="or" />
    <path d="M22,25 L22,150" className="is" />

    <path d="M22,110 L52,95 L85,80" className="or" />
    <path d="M22,110 L52,95 L85,80" className="is" />
    <path d="M44,100 L88,150" className="or" />
    <path d="M44,100 L88,150" className="is" />
    <use href="#ap" x="22" y="25" />

    <use href="#ap" x="22" y="110" />
    <use href="#ap" x="22" y="150" />
    <use href="#np" x="52" y="95" />
    <use href="#ap" x="85" y="80" />
    <use href="#ap" x="88" y="150" />
  </g>

  <g transform="translate(825,65)">
    <polygon points="55,78 85,88 98,115 98,125 85,142 55,150 25,142 12,125 12,115 25,88" className="or" />
    <polygon points="55,78 85,88 98,115 98,125 85,142 55,150 25,142 12,125 12,115 25,88" className="is" />
    <polygon points="55,92 76,98 84,115 84,125 76,134 55,138 34,134 26,125 26,115 34,98" className="cs" />
    <use href="#ap" x="55" y="78" />

    <use href="#np" x="98" y="120" />

    <use href="#ap" x="55" y="150" />

    <use href="#np" x="12" y="120" />

  </g>
</svg>


        <h2 className="text-xl font-bold mb-6 text-slate-200">Create 3D Volumetric Identifier</h2>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Identifier Name <span className="text-xs text-slate-500">(Max 9 chars)</span>
            </label>
            <input
              type="text"
              maxLength={9}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., RISTO"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-sky-500 focus:outline-none"
              required
            />
            {existsWarning && (
              <p className="mt-2 text-xs text-amber-400">⚠️ Warning: This name identifier already exists in cloud storage alliance.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">3D Render Style</label>
            <select
              value={styleSlot}
              onChange={(e) => setStyleSlot(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-sky-500 focus:outline-none"
            >
              <option value="0x01">Slot 0x01: Classic Sine/Cosine Matrix Wave</option>
              <option value="0x02">Slot 0x02: Spiral Lattice Rotation</option>
              <option value="0x03">Slot 0x03: Perlin Noise Voxel Flow</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-xl bg-sky-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? "Generating & Storing..." : "Generate Universal 2-Way ID"}
          </button>
        </form>

        {generatedId && (
          <div className="mt-8 rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 text-center">
            <p className="text-xs font-mono text-sky-400 mb-1">Universal 14-Byte 2-Way Identifier:</p>
            <code className="text-sm font-bold text-white break-all">{generatedId}</code>
            <p className="mt-2 text-[11px] text-slate-400">Stored & cached securely in Cloudflare R2 / Backblaze B2 alliance storage.</p>
          </div>
        )}
      </div>
    </div>
  );
}