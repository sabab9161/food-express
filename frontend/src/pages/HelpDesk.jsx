import { Bot, Clock, HelpCircle, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const quickQuestions = [
  "Where is my order?",
  "Cancel my order",
  "Payment issue",
  "Refund status",
  "Apply coupon",
  "Delivery partner details",
  "Restaurant contact",
  "Account issue"
];

const welcomeMessage = {
  role: "bot",
  text: "Hi, I am FoodExpress Help Desk. Ask me about your order, payment, refund, coupon, delivery partner, restaurant, or account."
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-2">
    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 [animation-delay:-0.2s]" />
    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 [animation-delay:-0.1s]" />
    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
  </div>
);

const HelpDesk = () => {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get("/helpdesk/history")
      .then(({ data }) => {
        if (!data.length) return;

        const historyMessages = data.flatMap((item) => [
          {
            role: "user",
            text: item.message,
            createdAt: item.createdAt
          },
          {
            role: "bot",
            text: item.response,
            createdAt: item.createdAt
          }
        ]);

        setMessages([welcomeMessage, ...historyMessages]);
      })
      .catch(() => toast.error("Unable to load help desk history"));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (messageText = input) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || loading) return;

    setInput("");
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text: trimmedMessage, createdAt: new Date().toISOString() }
    ]);
    setLoading(true);

    try {
      const { data } = await api.post("/helpdesk/chat", { message: trimmedMessage });
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "bot", text: data.reply, createdAt: new Date().toISOString() }
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to contact help desk");
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "bot",
          text: "I’m sorry, I could not understand. Please contact support or try asking about order, payment, coupon, refund, or delivery.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <section className="container-page py-8">
      <div className="grid min-h-[calc(100vh-10rem)] gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <HelpCircle size={23} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-ink">Help Desk</h1>
              <p className="text-sm font-semibold text-slate-500">Rule-based AI support</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Sparkles size={17} className="text-brand-500" />
              Quick questions
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {quickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm text-orange-800">
            <Clock size={18} className="mt-0.5 shrink-0" />
            <p className="font-semibold">
              Answers use your FoodExpress order, payment, coupon, restaurant, and delivery partner data.
            </p>
          </div>
        </aside>

        <div className="flex min-h-[640px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
                <Bot size={21} />
              </span>
              <div>
                <h2 className="text-lg font-black text-ink">FoodExpress Assistant</h2>
                <p className="text-sm font-semibold text-emerald-600">Online</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <Bot size={18} />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] rounded-lg px-4 py-3 text-sm font-semibold leading-6 shadow-sm sm:max-w-[70%] ${
                      isUser
                        ? "bg-brand-500 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {message.text}
                    {message.createdAt && (
                      <div className={`mt-2 text-xs ${isUser ? "text-orange-100" : "text-slate-400"}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <UserRound size={18} />
                    </span>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start gap-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
                  <Bot size={18} />
                </span>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <input
                className="input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your question..."
                disabled={loading}
              />
              <button type="submit" className="btn-primary shrink-0" disabled={loading || !input.trim()}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HelpDesk;
