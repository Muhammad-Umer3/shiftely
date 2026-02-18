# Monetization Model Options for Shiftely

## Current Model: Fixed Tiered Pricing
- **Starter**: $19/month (up to 10 employees)
- **Growth**: $39/month (up to 25 employees)  
- **Pro**: $69/month (up to 50 employees)

### Issues with Current Model:
- Price jumps are large ($19 → $39 → $69)
- Doesn't scale well for businesses between tiers
- Employee count is a proxy for value, not the actual value
- Hard to justify 2x price for 2.5x employees

---

## Option 1: Per-Employee Pricing (Recommended)
**Most common SaaS model, predictable revenue**

### Pricing Structure:
- **Base Plan**: $9/month (includes 3 employees)
- **Additional Employees**: $2-3 per employee/month
- **OR**: $4-5 per employee/month (no base fee)

### Example:
- 5 employees: $9 + (2 × $3) = $15/month
- 10 employees: $9 + (7 × $3) = $30/month
- 25 employees: $9 + (22 × $3) = $75/month
- 50 employees: $9 + (47 × $3) = $150/month

### Pros:
✅ Scales naturally with business size
✅ Predictable revenue growth
✅ Fair pricing (pay for what you use)
✅ Easy to understand

### Cons:
❌ Can get expensive for larger teams
❌ Need to track employee count changes

---

## Option 2: Freemium + Usage-Based
**Good for acquisition, converts to paid**

### Pricing Structure:
- **Free**: Up to 5 employees, 1 schedule/week, basic features
- **Starter**: $19/month - Up to 15 employees, unlimited schedules
- **Growth**: $39/month - Up to 30 employees, + AI features, analytics
- **Pro**: $59/month - Up to 50 employees, + advanced features, priority support

### Pros:
✅ Low barrier to entry (free tier)
✅ Easy to try before buying
✅ Natural upgrade path

### Cons:
❌ Free users cost money to support
❌ Lower conversion rates
❌ Need to limit free tier enough to drive upgrades

---

## Option 3: Hybrid Model (Base + Per Employee)
**Balances fixed and variable costs**

### Pricing Structure:
- **Base Fee**: $15/month (includes core features)
- **Per Employee**: $2.50/employee/month
- **Feature Add-ons**: 
  - AI Scheduling: +$10/month
  - Advanced Analytics: +$10/month
  - SMS Notifications: +$5/month
  - Payroll Integration: +$15/month

### Example:
- 10 employees + AI: $15 + (10 × $2.50) + $10 = $50/month
- 25 employees + all features: $15 + (25 × $2.50) + $40 = $117.50/month

### Pros:
✅ Flexible pricing
✅ Customers pay for what they need
✅ Higher revenue potential

### Cons:
❌ More complex to explain
❌ Harder to predict revenue

---

## Option 4: Value-Based Pricing
**Price based on time saved or schedules created**

### Pricing Structure:
- **Starter**: $29/month - Up to 2 hours saved/week (≈10 employees)
- **Growth**: $49/month - Up to 5 hours saved/week (≈25 employees)
- **Pro**: $79/month - Up to 10 hours saved/week (≈50 employees)

### Pros:
✅ Aligns price with value delivered
✅ Easy to justify ROI

### Cons:
❌ Hard to measure "time saved"
❌ Less predictable

---

## Option 5: Seat-Based Pricing (Per User)
**Different from employee-based - counts all users**

### Pricing Structure:
- **Starter**: $15/month (3 seats included) + $5/seat
- **Growth**: $25/month (5 seats included) + $4/seat
- **Pro**: $40/month (10 seats included) + $3/seat

### Pros:
✅ Fair for multi-user access
✅ Encourages adoption across team

### Cons:
❌ Can be confusing (seats vs employees)
❌ May limit adoption if too expensive

---

## Recommendation: **Option 1 (Per-Employee) or Option 2 (Freemium)**

### For MVP/Launch: **Freemium Model**
- Free tier: 5 employees, basic features
- Starter: $19/month (15 employees)
- Growth: $39/month (30 employees)  
- Pro: $59/month (50 employees)

### For Scale: **Per-Employee Pricing**
- Base: $9/month (includes 3 employees)
- Additional: $3/employee/month
- Max: $150/month (50 employees)

---

## Implementation Considerations:

1. **Tier Enforcement**: Need middleware to check employee count
2. **Upgrade/Downgrade**: Handle prorated billing
3. **Overage Handling**: What happens when they exceed limit?
4. **Annual Discounts**: Offer 15-20% off for annual billing
5. **Trial Period**: 14-day free trial for paid plans
