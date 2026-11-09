export default function OrdersLoading() {
  return <section className="p-6 md:p-10"><div className="animate-pulse"><div className="h-3 w-24 rounded bg-[#eadfce]" /><div className="mt-3 h-12 w-48 rounded bg-[#eadfce]" /><div className="mt-8 grid gap-4">{[1, 2, 3].map((item) => <div key={item} className="h-40 rounded-2xl bg-[#eadfce]" />)}</div></div></section>
}
