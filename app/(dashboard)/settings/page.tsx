'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Camera, Mail, MessageSquare, Smartphone, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Configure your system preferences</p>
      </div>

      {/* Company Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Company Branding</CardTitle>
          <CardDescription>Your business information and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary rounded-full p-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">MediaPay</h3>
              <p className="text-sm text-gray-500">Stories That Connect</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="mt-1">info@mediapay.com</p>
            </div>
            <div>
              <Label className="text-gray-600">Phone</Label>
              <p className="mt-1">+254 700 000 000</p>
            </div>
            <div>
              <Label className="text-gray-600">Location</Label>
              <p className="mt-1">Nairobi, Kenya</p>
            </div>
            <div>
              <Label className="text-gray-600">Website</Label>
              <p className="mt-1">www.mediapay.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Preferences</CardTitle>
          <CardDescription>Configure how passwords are delivered to clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Delivery</p>
                <p className="text-sm text-gray-600">Send passwords via email</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Enabled
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">SMS Delivery</p>
                <p className="text-sm text-gray-600">Send passwords via SMS</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Enabled
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">WhatsApp Delivery</p>
                <p className="text-sm text-gray-600">Send passwords via WhatsApp</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Enabled
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Password generation and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Auto-generated Passwords</p>
              <p className="text-sm text-gray-600">12-character secure passwords using nanoid</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Example:</strong> <code className="bg-white px-2 py-1 rounded">V1StGXR8_Z5j</code>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Passwords are cryptographically secure and URL-safe
            </p>
          </div>
        </CardContent>
      </Card>

      {/* demo notice removed for production-like UI */}
    </div>
  )
}
