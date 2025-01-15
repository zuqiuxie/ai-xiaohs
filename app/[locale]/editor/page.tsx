import XhsEditor from '../../components/XhsEditor'

export const dynamic = 'force-dynamic';

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <XhsEditor />
    </main>
  )
}