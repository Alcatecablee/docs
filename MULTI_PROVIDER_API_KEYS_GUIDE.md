# Multi-Provider API Keys Setup Guide

This guide helps you obtain API keys for all supported LLM providers, prioritizing FREE options.

---

## 🎯 Priority Order (Free-First)

The system automatically uses providers in this order:
1. **Google AI** (Gemini) - 1M tokens/min FREE
2. **Together AI** - $25 FREE credits
3. **OpenRouter** - Completely FREE (Llama 70B)
4. **Groq** - 6K tokens/min FREE
5. **Hyperbolic** - 200 RPM FREE
6. **DeepSeek** - Very cheap paid fallback
7. **OpenAI** - Paid fallback

---

## 🆓 Free Providers (Set these up first!)

### 1. Google AI Studio (HIGHEST PRIORITY) ⭐
**Why:** 1 MILLION tokens/minute free tier - this is HUGE!

**Setup:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API key"
4. Copy your API key
5. Add to Replit Secrets:
   ```
   GOOGLE_API_KEY=your_key_here
   ```

**Models Available:**
- `gemini-2.0-flash-exp` (default)
- `gemini-2.5-flash`
- Excellent quality, comparable to GPT-4

**Free Tier:**
- **1,000,000 tokens per minute** 🔥
- No credit card required
- Perfect for 24/7 doc generation

---

### 2. Together AI ⭐
**Why:** $25 free credits + access to Llama 3.1 405B (best quality)

**Setup:**
1. Go to [Together AI](https://together.ai)
2. Sign up (email or GitHub)
3. Get $25 free credits automatically
4. Go to [API Keys](https://api.together.ai/settings/api-keys)
5. Create new API key
6. Add to Replit Secrets:
   ```
   TOGETHER_API_KEY=your_key_here
   ```

**Models Available:**
- `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` (default)
- `meta-llama/Meta-Llama-3.1-405B-Instruct` (highest quality)
- DeepSeek R1, Qwen 2.5

**Free Credits:**
- $25 free on signup
- Approx 30M tokens
- Use for complex docs requiring best quality

---

### 3. OpenRouter 🆓
**Why:** Completely free Llama 70B model, no time limit!

**Setup:**
1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up with email or GitHub
3. Go to [Keys](https://openrouter.ai/keys)
4. Create API key
5. Add to Replit Secrets:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```

**Models Available (FREE):**
- `meta-llama/llama-3.1-70b-instruct:free` (default)
- DeepSeek v3:free
- Google Gemini models (free tier)

**Free Tier:**
- Completely FREE (ad-supported)
- No rate limits mentioned
- Perfect backup provider

---

### 4. Groq 🆓
**Why:** FASTEST inference (300+ tokens/second)

**Setup:**
1. Go to [Groq Console](https://console.groq.com)
2. Sign up (free account)
3. Go to [API Keys](https://console.groq.com/keys)
4. Create new API key
5. Add to Replit Secrets:
   ```
   GROQ_API_KEY=your_key_here
   ```

**Models Available:**
- `llama-3.3-70b-versatile` (default)
- `llama-3.1-70b-versatile`
- Mixtral, Gemma

**Free Tier:**
- 6,000 tokens per minute
- ~8.6M tokens/month
- Ultra-fast responses (300+ tok/sec)

---

### 5. Hyperbolic 🆓
**Why:** Free access to Llama 3.1 405B (best quality open model)

**Setup:**
1. Go to [Hyperbolic](https://hyperbolic.xyz)
2. Sign up
3. Navigate to API settings
4. Generate API key
5. Add to Replit Secrets:
   ```
   HYPERBOLIC_API_KEY=your_key_here
   ```

**Models Available:**
- `meta-llama/Meta-Llama-3.1-405B-Instruct` (default)
- DeepSeek R1
- Mistral Large

**Free Tier:**
- Up to 200 requests/minute
- Best quality free 405B access
- Use for flagship docs

---

## 💰 Paid Fallback Providers (Optional)

### 6. DeepSeek (Very Cheap)
**Why:** Extremely cheap ($0.27 per 1M tokens)

**Setup:**
1. Go to [DeepSeek](https://platform.deepseek.com)
2. Sign up
3. Add payment method
4. Get API key
5. Add to Replit Secrets:
   ```
   DEEPSEEK_API_KEY=your_key_here
   ```

**Cost:** $0.27 per 1M input tokens

---

### 7. OpenAI (Last Resort)
**Why:** Highest quality, but most expensive

**Setup:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up and add payment
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create new key
5. Add to Replit Secrets:
   ```
   OPENAI_API_KEY=your_key_here
   ```

**Cost:** 
- GPT-4o-mini: $0.15 per 1M input tokens
- GPT-4o: $2.50 per 1M input tokens

---

## 🔧 Replit Secrets Setup

### Adding Secrets in Replit:
1. Open your Replit project
2. Click on "Secrets" in the left sidebar (🔐 icon)
3. Add each API key:
   - Key: `GOOGLE_API_KEY`
   - Value: your actual API key
4. Click "Add Secret"
5. Repeat for all providers you want to use

### Or use `.env` file (for local development):
```bash
# Free Providers (Priority)
GOOGLE_API_KEY=your_google_ai_key_here
TOGETHER_API_KEY=your_together_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
GROQ_API_KEY=your_groq_key_here
HYPERBOLIC_API_KEY=your_hyperbolic_key_here

# Paid Fallbacks (Optional)
DEEPSEEK_API_KEY=your_deepseek_key_here
OPENAI_API_KEY=your_openai_key_here

# Custom Provider Order (Optional)
# AI_PROVIDER_ORDER=google,together,openrouter,groq,hyperbolic,deepseek,openai
```

---

## 🎯 Recommended Setup for Zero Cost

**Minimum Required (100% Free):**
```bash
GOOGLE_API_KEY=xxx        # Primary - 1M TPM
TOGETHER_API_KEY=xxx      # $25 credits for quality
OPENROUTER_API_KEY=xxx    # Unlimited free backup
```

This gives you:
- **Primary**: Google AI (1M tokens/min) for 99% of requests
- **Quality**: Together AI ($25 credits) for complex docs
- **Backup**: OpenRouter (unlimited free) when others hit limits

**Total Monthly Capacity (FREE):**
- ~45M tokens from Google
- ~30M tokens from Together (one-time $25)
- Unlimited from OpenRouter
- = **Enough for hundreds of comprehensive docs per month**

---

## 🚀 Quick Start

1. **Set up Google AI** (5 minutes)
   - Highest priority, largest free tier
   - No credit card needed

2. **Add Together AI** (5 minutes)
   - Get $25 free credits
   - Use for complex/flagship docs

3. **Add OpenRouter** (3 minutes)
   - Completely free backup
   - No limits

**Total time: 15 minutes to setup 100% free infrastructure**

---

## ✅ Verification

After adding keys, the server will log:
```
ENV: GOOGLE_API_KEY set: true, TOGETHER_API_KEY set: true, OPENROUTER_API_KEY set: true
```

Check console logs to verify providers are configured correctly.

---

## 📊 Cost Projection

### With Free Tier Only:
- **Monthly Cost: $0**
- **Capacity: 100M+ tokens**
- **Sufficient for:** Hundreds of docs

### If Free Exhausted (unlikely):
- DeepSeek fallback: $0.27 per 1M tokens
- Estimated: $0-$5/month

---

## 🎯 Strategy for YC Application

1. **Week 1:** Setup all free providers
2. **Week 2-3:** Generate 4-6 flagship docs:
   - Stripe
   - Supabase
   - Next.js
   - Vercel
   - Tailwind
   - React
3. **Week 4:** Launch waitlist with examples
4. **Apply to YC** with:
   - Working product
   - Real examples
   - Waitlist numbers
   - Zero infrastructure cost

---

## 🆘 Troubleshooting

**"No AI providers configured" error:**
- Restart the workflow after adding secrets
- Check secret names are exact (case-sensitive)
- At least one provider must be configured

**Rate limit errors:**
- System will automatically fall back to next provider
- Google's 1M TPM is very generous
- Add more providers for redundancy

**Quality issues:**
- Use Together AI (405B) for complex docs
- Google Gemini 2.0 Flash is excellent quality
- Hyperbolic 405B for flagship examples

---

## 📞 Support

Check server logs to see which provider handled each request:
```
✅ JSON parsed successfully using google (attempt 1)
```

This helps you monitor free tier usage across providers.
