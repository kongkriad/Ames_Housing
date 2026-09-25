'use client';

import { useMemo, useState } from 'react';
import { Orbitron, Space_Grotesk } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--font-orbitron' });
const grotesk = Space_Grotesk({ subsets: ['latin', 'thai'] as any, weight: ['400', '500', '600'], variable: '--font-grotesk' });

// ---- encoded category maps (order defines the integer code) ----
const FURNISHED_OPTIONS = ['Partially Furnished', 'Fully Furnished', 'Unfurnished'] as const;
const PROPERTY_TYPE_OPTIONS = ['Detached House', 'Townhouse'] as const;

const FURNISHED_LABEL_TH: Record<(typeof FURNISHED_OPTIONS)[number], string> = {
  'Partially Furnished': 'ตกแต่งบางส่วน',
  'Fully Furnished': 'ตกแต่งครบครัน',
  Unfurnished: 'ไม่ตกแต่ง',
};

const PROPERTY_TYPE_LABEL_TH: Record<(typeof PROPERTY_TYPE_OPTIONS)[number], string> = {
  'Detached House': 'บ้านเดี่ยว',
  Townhouse: 'ทาวน์เฮาส์',
};

type FormState = {
  living_space: number;
  land_space: number;
  bedroom_number: number;
  bathroom_number: number;
  floor_level: number;
  built_year: number;
  furnished: (typeof FURNISHED_OPTIONS)[number];
  property_type: (typeof PROPERTY_TYPE_OPTIONS)[number];
};

const DEFAULT_STATE: FormState = {
  living_space: 150,
  land_space: 200,
  bedroom_number: 3,
  bathroom_number: 2,
  floor_level: 2,
  built_year: 2020,
  furnished: 'Fully Furnished',
  property_type: 'Detached House',
};

export default function Page() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [prediction, setPrediction] = useState<number | null>(null);

  const payload = useMemo(
    () => ({
      living_space: [form.living_space],
      land_space: [form.land_space],
      bedroom_number: [form.bedroom_number],
      bathroom_number: [form.bathroom_number],
      floor_level: [form.floor_level],
      built_year: [form.built_year],
      furnished: [FURNISHED_OPTIONS.indexOf(form.furnished)],
      property_type: [PROPERTY_TYPE_OPTIONS.indexOf(form.property_type)],
    }),
    [form]
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setPrediction(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('request failed');
      const data = await res.json();
      setPrediction(data.predicted_price ?? null);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main
      className={`${orbitron.variable} ${grotesk.variable} relative min-h-screen overflow-hidden bg-[#0A0416] text-[#E8ECF1]`}
      style={{ fontFamily: 'var(--font-grotesk)' }}
    >
      {/* ---------- backdrop: sun + horizon grid ---------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#2A0B45_0%,#0A0416_60%)]" />
        <div
          className="absolute left-1/2 top-[8%] h-[220px] w-[220px] -translate-x-1/2 rounded-full opacity-90 sm:h-[300px] sm:w-[300px]"
          style={{
            background: 'linear-gradient(180deg,#FFC857 0%,#FF8A5B 35%,#FF3EC9 70%,#B026FF 100%)',
            boxShadow: '0 0 90px 10px rgba(255,62,201,0.35)',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent 0px, transparent 10px, #0A0416 10px, #0A0416 16px)',
              maskImage: 'linear-gradient(to bottom, transparent 42%, black 42%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 42%, black 42%)',
            }}
          />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{ perspective: '260px', perspectiveOrigin: '50% 0%' }}
        >
          <div
            className="absolute inset-0 animate-[grid-scroll_9s_linear_infinite] motion-reduce:animate-none"
            style={{
              backgroundImage:
                'linear-gradient(#FF3EC9 1px, transparent 1px), linear-gradient(90deg, #FF3EC9 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              transform: 'rotateX(75deg) translateY(-20%)',
              opacity: 0.35,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0416]" />
        {/* scanlines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
          }}
        />
      </div>

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-20 pt-14 sm:pt-20">
        <span className="mb-3 text-[13px] tracking-[0.3em] text-[#37E8FF]/80">ESTATE.EXE // 1988</span>
        <h1
          className="text-center text-[clamp(2rem,6vw,3.4rem)] font-900 leading-[1.05] tracking-tight"
          style={{
            fontFamily: 'var(--font-orbitron)',
            backgroundImage: 'linear-gradient(180deg,#F4F6FA 0%,#C9D6DF 45%,#8892A6 55%,#F4F6FA 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.6)) drop-shadow(0 0 24px rgba(55,232,255,0.25))',
          }}
        >
          ทำนายราคาบ้านแห่งอนาคต
        </h1>
        <p className="mt-4 max-w-md text-center text-[15px] text-[#B7AEDB]">
          ป้อนข้อมูลอสังหาริมทรัพย์ของคุณ แล้วให้ระบบประมวลผลราคาประเมินในสไตล์เทอร์มินัลย้อนยุค
        </p>

        {/* ---------- console panel ---------- */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full rounded-2xl border border-[#37E8FF]/25 bg-[#120A24]/80 p-5 shadow-[0_0_40px_-8px_rgba(255,62,201,0.35)] backdrop-blur sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="พื้นที่ใช้สอย"
              unit="ตร.ม."
              value={form.living_space}
              min={0}
              step={1}
              onChange={(v) => setField('living_space', v)}
            />
            <NumberField
              label="พื้นที่ที่ดิน"
              unit="ตร.ม."
              value={form.land_space}
              min={0}
              step={1}
              onChange={(v) => setField('land_space', v)}
            />
            <Stepper
              label="ห้องนอน"
              value={form.bedroom_number}
              min={0}
              onChange={(v) => setField('bedroom_number', v)}
            />
            <Stepper
              label="ห้องน้ำ"
              value={form.bathroom_number}
              min={0}
              onChange={(v) => setField('bathroom_number', v)}
            />
            <Stepper
              label="จำนวนชั้น"
              value={form.floor_level}
              min={1}
              onChange={(v) => setField('floor_level', v)}
            />
            <NumberField
              label="ปีที่สร้าง"
              unit="ค.ศ."
              value={form.built_year}
              min={1950}
              max={2026}
              step={1}
              onChange={(v) => setField('built_year', v)}
            />
          </div>

          <div className="mt-6">
            <FieldLabel>สภาพการตกแต่ง</FieldLabel>
            <ButtonGroup
              options={FURNISHED_OPTIONS as unknown as string[]}
              labels={FURNISHED_LABEL_TH}
              value={form.furnished}
              onChange={(v) => setField('furnished', v as FormState['furnished'])}
            />
          </div>

          <div className="mt-6">
            <FieldLabel>ประเภททรัพย์</FieldLabel>
            <ButtonGroup
              options={PROPERTY_TYPE_OPTIONS as unknown as string[]}
              labels={PROPERTY_TYPE_LABEL_TH}
              value={form.property_type}
              onChange={(v) => setField('property_type', v as FormState['property_type'])}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group relative mt-8 w-full overflow-hidden rounded-lg border border-[#37E8FF]/60 bg-[#0F1B2E] py-3.5 text-[15px] font-medium tracking-wide text-[#B9F5FF] transition-shadow hover:shadow-[0_0_24px_rgba(55,232,255,0.55)] disabled:opacity-60"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            {status === 'loading' ? 'กำลังประมวลผล…' : 'คำนวณราคาประเมิน'}
          </button>
        </form>

        {/* ---------- terminal readout ---------- */}
        <div className="mt-6 w-full rounded-xl border border-[#FF3EC9]/25 bg-black/60 p-4 font-mono text-[12.5px] leading-relaxed text-[#7CF6C9] sm:p-5">
          <div className="mb-2 flex items-center justify-between text-[#FF3EC9]/70">
            <span>PAYLOAD.JSON</span>
            <span>{status === 'done' ? 'OK 200' : status === 'error' ? 'ERR 500' : status === 'loading' ? 'SENDING…' : 'READY'}</span>
          </div>
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(payload, null, 2)}</pre>
          {prediction !== null && (
            <div className="mt-3 border-t border-[#7CF6C9]/20 pt-3 text-[#FFC857]">
              ราคาประเมิน ≈ {prediction.toLocaleString('th-TH')} บาท
            </div>
          )}
          {status === 'error' && (
            <div className="mt-3 border-t border-[#7CF6C9]/20 pt-3 text-[#FF6B6B]">
              เชื่อมต่อ /api/predict ไม่สำเร็จ — ตรวจสอบว่าเชื่อมโมเดลจริงแล้วหรือยัง
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes grid-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 60px; }
        }
      `}</style>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[13px] text-[#9C8FBF]">{children}</div>;
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2 rounded-lg border border-[#3B2A5E] bg-[#0D0620] px-3 py-2.5 focus-within:border-[#37E8FF]/70 focus-within:shadow-[0_0_0_3px_rgba(55,232,255,0.15)]">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-[15px] text-[#E8ECF1] outline-none"
        />
        {unit && <span className="shrink-0 text-[12px] text-[#7A6FA0]">{unit}</span>}
      </div>
    </label>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center justify-between rounded-lg border border-[#3B2A5E] bg-[#0D0620] px-2 py-2">
        <button
          type="button"
          aria-label={`ลด${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#FF3EC9] transition-colors hover:bg-[#FF3EC9]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF3EC9]"
        >
          −
        </button>
        <span className="text-[16px] tabular-nums text-[#E8ECF1]" style={{ fontFamily: 'var(--font-orbitron)' }}>
          {value}
        </span>
        <button
          type="button"
          aria-label={`เพิ่ม${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#37E8FF] transition-colors hover:bg-[#37E8FF]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#37E8FF]"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ButtonGroup({
  options,
  labels,
  value,
  onChange,
}: {
  options: string[];
  labels: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#37E8FF] ${
              active
                ? 'border-[#FFC857] bg-[#FFC857]/10 text-[#FFC857] shadow-[0_0_16px_rgba(255,200,87,0.35)]'
                : 'border-[#3B2A5E] text-[#9C8FBF] hover:border-[#7A6FA0]'
            }`}
          >
            {labels[opt] ?? opt}
          </button>
        );
      })}
    </div>
  );
}