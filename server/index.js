import express from 'express'
import cors from 'cors'
import { z } from 'zod'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Validate request body
    const validatedData = contactSchema.parse(req.body)

    // Log the contact form submission (in production, you'd send an email here)
    console.log('Contact form submission:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      timestamp: new Date().toISOString(),
    })

    // TODO: In production, integrate with email service (Resend, Nodemailer, etc.)
    // For now, we'll just log and return success

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error',
        details: error.errors,
      })
    }

    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process your message. Please try again later.',
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

