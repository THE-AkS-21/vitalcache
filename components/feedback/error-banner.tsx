export default function ErrorBanner({message}: {message: string}) {
  return <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">{message}</div>
}
