'use client'

import { useState } from 'react'
import { CreditCard, Building, Smartphone, DollarSign, Shield, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PaymentMethodsProps {
  projectId: string
  amount: number
  phoneNumber?: string
  email?: string
  onPaymentSuccess: () => void
}

interface OtpResponse {
  success: boolean
  otp?: string
}

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, color: 'text-green-600', description: 'Pay via M-Pesa STK Push' },
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-blue-600', description: 'Visa, Mastercard' },
  { id: 'bank', name: 'Bank Transfer', icon: Building, color: 'text-purple-600', description: 'Direct bank transfer' },
  { id: 'paypal', name: 'PayPal', icon: DollarSign, color: 'text-primary', description: 'Pay with PayPal' },
]

export default function PaymentMethods({ projectId, amount, phoneNumber: initialPhone, email, onPaymentSuccess }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('mpesa')
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [otpInput, setOtpInput] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  const validatePhoneNumber = (phone: string) => {
    // Kenyan phone number validation
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handlePayment = async () => {
    // Validate phone number for M-Pesa
    if (selectedMethod === 'mpesa') {
      if (!phoneNumber) {
        toast.error('Please enter your M-Pesa phone number')
        return
      }
      if (!validatePhoneNumber(phoneNumber)) {
        toast.error('Please enter a valid Kenyan phone number')
        return
      }
    }

    setIsProcessing(true)

    try {
      // Step 1: Initiate payment
      const initiateRes = await fetch('/api/client/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          method: selectedMethod,
          phoneNumber: selectedMethod === 'mpesa' ? phoneNumber : undefined,
        }),
      })

      if (!initiateRes.ok) {
        throw new Error('Failed to initiate payment')
      }

      const { paymentId } = await initiateRes.json()

      // Show processing message
      if (selectedMethod === 'mpesa') {
        toast.loading('Check your phone for M-Pesa prompt...', { duration: 2500 })
      } else {
        toast.loading('Processing payment...', { duration: 2500 })
      }

      // Step 2: Simulate payment completion
      await new Promise(resolve => setTimeout(resolve, 2500))

      const simulateRes = await fetch('/api/client/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })

      if (!simulateRes.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await simulateRes.json()

      // After successful simulation, send an OTP (demo mode)
      const sendOtpRes = await fetch('/api/client/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber || null, email: email || null }),
      })

      if (sendOtpRes.ok) {
        const j: OtpResponse = await sendOtpRes.json()
        if (j.otp) {
          // show OTP input to user (in demo we return otp)
          setDemoOtp(j.otp)
        }
        setOtpSent(true)
        toast.success('Payment processed. Enter the OTP sent to your phone to confirm.')
      } else {
        // If OTP send failed, still proceed but warn
        toast.success('Payment processed. (OTP send failed in demo)')
        setTimeout(() => onPaymentSuccess(), 1500)
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(amount)}</span>
        </div>
      </div>

      {/* OTP flow (shown after payment simulation) */}
      {otpSent && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-medium mb-2">Enter OTP to confirm payment</p>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              disabled={isVerifyingOtp}
            />
            <Button
              onClick={async () => {
                setIsVerifyingOtp(true)
                try {
                  const verifyRes = await fetch('/api/client/otp/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneNumber || null, email: email || null, code: otpInput }),
                  })

                  if (!verifyRes.ok) {
                    const err = await verifyRes.json()
                    throw new Error(err?.error || 'OTP verification failed')
                  }

                  toast.success('OTP verified — payment confirmed!')
                  // Finalize UI
                  setTimeout(() => onPaymentSuccess(), 800)
                } catch (err: any) {
                  console.error('OTP verify error:', err)
                  toast.error(err.message || 'OTP verification failed')
                } finally {
                  setIsVerifyingOtp(false)
                }
              }}
              disabled={isVerifyingOtp}
            >
              {isVerifyingOtp ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify'}
            </Button>
          </div>
          {demoOtp && (
            <p className="text-xs text-gray-500 mt-2">(Demo OTP: {demoOtp})</p>
          )}
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Payment Method</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card
                key={method.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedMethod === method.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'border-gray-200'
                )}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn('h-5 w-5', method.color)} />
                        <span className="font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* M-Pesa Phone Number Input */}
      {selectedMethod === 'mpesa' && (
        <div className="space-y-2">
          <Label htmlFor="phone">M-Pesa Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+254712345678 or 0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500">
            Enter the phone number registered with M-Pesa
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <Shield className="h-5 w-5 text-accent mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Secure Payment</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Your payment information is encrypted and secure. This is a demo system - no real transactions are processed.
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || (selectedMethod === 'mpesa' && !phoneNumber)}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>Pay {formatCurrency(amount)}</>
        )}
      </Button>

      {/* demo notice removed for cleaner UI */}
    </div>
  )
}
