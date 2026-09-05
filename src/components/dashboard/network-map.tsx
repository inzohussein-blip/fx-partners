"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { quickUpdate } from "@/lib/actions/quick-update";
import { Building2, Link2, Ticket, Loader2, Check, X } from "lucide-react";
import type { NetworkBroker } from "@/lib/network";

type Selected =
  | { table: "brokers"; id: string; title: string; value: string; sub?: string }
  | { table: "broker_links"; id: string; title: string; value: string; sub?: string }
  | { table: "coupons"; id: string; title: string; value: string; sub?: string }
  | null;

const NODE_STYLE: React.CSSProperties = {
  background: "#111c27",
  border: "1px solid rgba(0,209,230,0.25)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
  padding: "8px 12px",
  width: 190,
  textAlign: "right",
  fontFamily: "var(--font-cairo), sans-serif",
};

export function NetworkMap({ brokers }: { brokers: NetworkBroker[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Selected>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let y = 0;
    const GAP = 90;

    brokers.forEach((b) => {
      const brokerY = y;
      nodes.push({
        id: `b_${b.id}`,
        position: { x: 0, y: brokerY },
        data: {
          label: `🏢 ${b.name}`,
          table: "brokers",
          rid: b.id,
          value: b.name,
          sub: b.status,
        },
        style: { ...NODE_STYLE, borderColor: "rgba(0,209,230,0.5)", fontWeight: 700 },
      });

      const children = [...b.links, ...b.coupons];
      const childCount = Math.max(children.length, 1);
      children.forEach((child, i) => {
        const childY = brokerY + (i - (childCount - 1) / 2) * GAP;
        const isLink = "referral_url" in child;
        const nid = isLink ? `l_${child.id}` : `c_${child.id}`;
        nodes.push({
          id: nid,
          position: { x: 320, y: childY },
          data: isLink
            ? {
                label: `🔗 ${(child as NetworkBroker["links"][number]).label || "رابط إحالة"}`,
                table: "broker_links",
                rid: child.id,
                value: (child as NetworkBroker["links"][number]).referral_url,
                sub: (child as NetworkBroker["links"][number]).code ?? "",
              }
            : {
                label: `🎟️ ${(child as NetworkBroker["coupons"][number]).title}`,
                table: "coupons",
                rid: child.id,
                value: (child as NetworkBroker["coupons"][number]).title,
                sub: (child as NetworkBroker["coupons"][number]).code,
              },
          style: NODE_STYLE,
        });
        edges.push({
          id: `e_${b.id}_${nid}`,
          source: `b_${b.id}`,
          target: nid,
          animated: isLink,
          style: { stroke: "rgba(0,209,230,0.35)" },
        });
      });

      y = brokerY + Math.max(childCount, 1) * GAP + GAP;
    });

    return { nodes, edges };
  }, [brokers]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    const d = node.data as { table: Selected extends null ? never : string; rid: string; value: string; sub?: string; label: string };
    setSelected({ table: d.table as "brokers", id: d.rid, title: d.label, value: d.value, sub: d.sub } as Selected);
    setValue(d.value);
    setError(null);
  }, []);

  async function save() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const res = await quickUpdate(selected.table, selected.id, value);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setSelected(null);
    router.refresh();
  }

  if (brokers.length === 0) {
    return (
      <div className="card-surface p-10 text-center text-sm text-slate-500">
        لا توجد شركات لعرضها. أضِف شركات وروابط من دليل الشركات.
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-900/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background color="rgba(255,255,255,0.06)" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Side panel */}
      {selected && (
        <div className="absolute inset-y-0 end-0 z-10 w-full max-w-xs border-s border-white/10 bg-ink-800/95 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {selected.table === "brokers" ? (
                <Building2 className="h-4 w-4 text-brand-300" />
              ) : selected.table === "broker_links" ? (
                <Link2 className="h-4 w-4 text-brand-300" />
              ) : (
                <Ticket className="h-4 w-4 text-brand-300" />
              )}
              {selected.table === "brokers"
                ? "الشركة"
                : selected.table === "broker_links"
                  ? "رابط إحالة"
                  : "كوبون"}
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white" aria-label="إغلاق">
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs text-slate-400">
              {selected.table === "broker_links" ? "رابط الإحالة" : "الاسم / العنوان"}
            </span>
            <textarea
              rows={selected.table === "broker_links" ? 3 : 2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              dir={selected.table === "broker_links" ? "ltr" : "auto"}
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-white focus:border-brand-500/50 focus:outline-none"
            />
          </label>
          {selected.sub && (
            <p className="mt-2 text-xs text-slate-500">
              الكود: <span dir="ltr" className="text-brand-300">{selected.sub}</span>
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

          <button
            onClick={save}
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            حفظ
          </button>
        </div>
      )}
    </div>
  );
}
