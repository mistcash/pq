"use client";

/** Paste a Channel Key someone sent you, then tap them in People to join. */
export const PasteKey = ({ value, onChange }: { value: string; onChange: (key: string) => void }) => (
  <label className="flex flex-col items-center gap-2 mt-6">
    <span className="text-base-content/70">{value ? "Now tap who sent it ↑" : "Got a key from someone?"}</span>
    <input
      className="input input-lg w-full rounded-full text-center"
      placeholder="Paste it here"
      value={value}
      onChange={e => onChange(e.target.value.trim())}
    />
  </label>
);
