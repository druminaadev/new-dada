'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { useStore } from '@/store/appStore'

interface Msg { role: 'bot' | 'user'; text: string }

const WELCOME = `Hi! I'm Dada Finance Assistant 👋\nAsk me about loans, customers, employees, or how to use the system.`

function buildReply(
  q: string,
  stats: { loans: number; customers: number; employees: number; pending: number; approved: number; disbursed: number }
): string {
  const t = q.toLowerCase()
  if (/hello|hi|hey/.test(t)) return 'Hello! How can I help you with Dada Finance LMS today?'
  if (/help/.test(t)) return 'I can help with:\n• Loan status & counts\n• Customer & employee info\n• Navigation guidance\nJust ask!'
  if (/how many loan|total loan|loan count/.test(t))
    return `There are ${stats.loans} loans total:\n• Pending: ${stats.pending}\n• Approved: ${stats.approved}\n• Disbursed: ${stats.disbursed}`
  if (/pending/.test(t)) return `${stats.pending} loan(s) are pending approval. Go to Loans → Loan Approval.`
  if (/approv/.test(t)) return `${stats.approved} loan(s) approved. Go to Loans → Loan Approval to approve pending ones.`
  if (/disburs/.test(t)) return `${stats.disbursed} loan(s) disbursed. View under Loans → Disbursed Loan List.`
  if (/customer/.test(t)) return `${stats.customers} customers registered. Manage under Customer menu.`
  if (/employee/.test(t)) return `${stats.employees} employees in the system. Manage under Employee menu.`
  if (/add loan/.test(t)) return 'Go to Loans → Add Loan from the sidebar.'
  if (/add customer/.test(t)) return 'Go to Customer → Add Customer from the sidebar.'
  if (/add employee/.test(t)) return 'Go to Employee → Add Employee from the sidebar.'
  if (/master/.test(t)) return 'Master data: States, Cities, Areas, Branches, Loan Types, Banks — all under the Master menu.'
  if (/login|password|credential/.test(t))
    return 'Demo credentials:\n• admin / admin123\n• employee / emp123\n• approver / apr123'
  return "I'm not sure about that. Try asking about loans, customers, employees, or navigation."
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { loans, customers, employees } = useStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendText = (text: string) => {
    if (!text.trim()) return
    const stats = {
      loans: loans.length,
      customers: customers.length,
      employees: employees.length,
      pending: loans.filter(l => l.status === 'pending').length,
      approved: loans.filter(l => l.status === 'approved').length,
      disbursed: loans.filter(l => l.status === 'disbursed').length,
    }
    setMsgs(m => [...m, { role: 'user', text }, { role: 'bot', text: buildReply(text, stats) }])
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    sendText(text)
    setInput('')
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-xl flex items-center justify-center transition-colors cursor-pointer"
        title="Chat with Dada Assistant"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-700 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Dada Assistant</div>
              <div className="text-xs opacity-70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72 bg-slate-50">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'bot' ? 'bg-blue-100' : 'bg-slate-200'}`}>
                  {m.role === 'bot'
                    ? <Bot size={12} className="text-blue-700" />
                    : <User size={12} className="text-slate-600" />}
                </div>
                <div className={`text-xs px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-line leading-relaxed ${
                  m.role === 'bot'
                    ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                    : 'bg-blue-700 text-white rounded-tr-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-slate-100 bg-white">
            {['Loan count', 'Pending loans', 'Add customer'].map(s => (
              <button
                key={s}
                onClick={() => sendText(s)}
                className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-full whitespace-nowrap cursor-pointer transition-colors shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-200 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask something..."
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white text-slate-800 placeholder:text-slate-400"
            />
            <button
              onClick={send}
              className="w-8 h-8 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
