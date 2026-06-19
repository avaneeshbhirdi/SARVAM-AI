import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, Loader2, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logoSvg from '../assets/logo.svg'

export default function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')
  const isAnnual = searchParams.get('isAnnual') === 'true'

  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form State
  const [email, setEmail] = useState('')
  const [cardName, setCardName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
        return
      }
      setSession(session)
      setEmail(session.user.email || '')
      setLoadingSession(false)
    })
  }, [navigate])

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-ink-muted">Invalid payment request.</p>
      </div>
    )
  }

  // Pricing Logic
  let price = 0
  let originalPrice = 0
  let planName = ''
  
  if (plan === 'pro') {
    planName = 'Pro'
    price = isAnnual ? 299 : 399
    originalPrice = 399
  } else if (plan === 'max') {
    planName = 'Max'
    price = isAnnual ? 499 : 599
    originalPrice = 599
  }

  const total = isAnnual ? price * 12 : price

  const handlePayment = async (e) => {
    e.preventDefault()
    if (isProcessing || isSuccess) return

    setIsProcessing(true)

    // Load Razorpay Script
    const loadScript = () => new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const isLoaded = await loadScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay SDK. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // 1. Create order on backend
      const response = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({ amount: total * 100, currency: 'INR' }) // Minimum 100 paise
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sarvam AI',
        description: `Upgrade to ${planName} Plan`,
        image: logoSvg,
        order_id: orderData.order_id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSession.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            setIsProcessing(false);
            setIsSuccess(true);
            
            setTimeout(() => {
              navigate('/');
            }, 2000);

          } catch (err) {
            alert(err.message);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: cardName,
          email: email,
        },
        theme: {
          color: '#0d0d0d'
        },
        modal: {
           ondismiss: function() {
             setIsProcessing(false);
           }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(response.error.description);
        setIsProcessing(false);
      });
      rzp1.open();

    } catch (err) {
      alert(err.message)
      setIsProcessing(false)
    }
  }

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-paper"><Loader2 className="w-8 h-8 text-coral animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row relative overflow-hidden">
      
      {/* LEFT SIDE: Form */}
      <div className="flex-1 bg-card min-h-[50vh] md:min-h-screen flex flex-col justify-center px-6 py-12 md:px-16 relative z-10 border-r border-edge">
        <div className="max-w-md w-full mx-auto relative">
          
          <button onClick={() => navigate('/subscription')} className="absolute -top-12 -left-2 p-2 text-ink-muted hover:text-ink transition-colors rounded-full hover:bg-paper-warm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <img src={logoSvg} alt="Sarvam AI" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-semibold tracking-[-0.02em] text-ink">sarvam<span className="text-coral">.ai</span></span>
          </div>

          <h1 className="text-2xl font-bold text-ink mb-6">Complete your payment</h1>

          {isSuccess ? (
             <div className="bg-teal/10 border border-teal/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-up">
               <div className="w-16 h-16 bg-teal/20 text-teal rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-ink mb-2">Payment Successful</h3>
               <p className="text-ink-soft text-sm">You have been upgraded to the {planName} plan. Redirecting you to the dashboard...</p>
             </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5 animate-fade-up">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1.5">Email address (for receipt)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-paper border border-edge focus:border-coral outline-none transition-colors input-focus-ring text-ink text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl bg-paper border border-edge focus:border-coral outline-none transition-colors input-focus-ring text-ink text-sm placeholder:text-ink-ghost"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl font-semibold bg-ink text-paper hover:bg-ink-soft transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-ink/10"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Starting Secure Checkout...</>
                  ) : (
                    <>Proceed to Pay ₹{total}</>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted mt-6">
                <Lock className="w-3.5 h-3.5" /> Secure checkout powered by <strong className="text-ink-soft">Razorpay</strong>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* RIGHT SIDE: Summary */}
      <div className="flex-1 bg-paper-warm min-h-[50vh] md:min-h-screen flex flex-col px-6 py-12 md:px-16 relative">
        <div className="max-w-md w-full mx-auto md:ml-0 md:mt-24">
          <p className="text-sm font-semibold tracking-wider text-ink-muted uppercase mb-4">Order Summary</p>
          
          <div className="bg-card rounded-2xl border border-edge p-6 shadow-sm mb-6">
            <div className="flex justify-between items-start mb-6 border-b border-edge pb-6">
              <div>
                <h3 className="text-lg font-bold text-ink">Sarvam AI {planName}</h3>
                <p className="text-sm text-ink-soft mt-1">{isAnnual ? 'Billed Annually' : 'Billed Monthly'}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-display font-bold text-ink flex items-baseline">
                  <span className="font-[Poppins] text-base font-bold mr-0.5">₹</span>
                  <span className="font-[Poppins]">{price}</span>
                  <span className="text-xs font-normal text-ink-muted ml-0.5">/mo</span>
                </div>
                {isAnnual && (
                  <div className="text-xs text-coral font-medium mt-1 line-through opacity-60">₹{originalPrice}/mo</div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              {isAnnual && (
                <div className="flex justify-between text-coral font-medium">
                  <span>Annual Savings</span>
                  <span>-₹{(originalPrice - price) * 12}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-ink text-base pt-3 border-t border-edge mt-3">
                <span>Total Due Today</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-teal/5 p-4 rounded-xl border border-teal/10">
            <ShieldCheck className="w-5 h-5 text-teal shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">Risk-free 14-day guarantee</p>
              <p className="text-xs text-ink-soft mt-1">If you're not satisfied with {planName}, you can request a full refund within 14 days.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
