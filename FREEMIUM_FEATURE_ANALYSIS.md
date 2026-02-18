# Freemium Feature Restriction Analysis

## Core Value Proposition
**Free tier should:**
- ✅ Be valuable enough to attract users
- ✅ Show the product's core value
- ✅ Create natural upgrade triggers
- ❌ Not be so generous that no one upgrades

---

## Feature Categories

### 1. **Core Scheduling** (Should be FREE)
**Why**: This is the main value prop - users need to see it works
- ✅ Create schedules
- ✅ Drag-and-drop shift assignment
- ✅ View schedules
- ✅ Basic shift management

**Restriction**: Limit to 1-2 active schedules at a time

---

### 2. **Employee Management** (Partially FREE)
**Why**: Need employees to create schedules
- ✅ Add employees (limited count)
- ✅ View employee profiles
- ✅ Basic employee info

**Restrictions**:
- ❌ Limited employee count (5 for free)
- ❌ No bulk import
- ❌ No advanced employee features

---

### 3. **AI Features** (PAID ONLY)
**Why**: High value, differentiates paid plans
- ❌ AI schedule suggestions (FREE: No, PAID: Yes)
- ❌ AI employee recommendations (FREE: No, PAID: Yes)
- ❌ Auto-fill schedules (FREE: Basic, PAID: AI-powered)

**Strategy**: Show "Upgrade for AI" prompts

---

### 4. **Notifications** (Partially FREE)
**Why**: Essential but can limit to drive upgrades
- ✅ Email notifications (FREE: Basic, PAID: Advanced)
- ❌ SMS notifications (PAID ONLY)
- ❌ Push notifications (PAID ONLY)
- ❌ Custom notification templates (PAID ONLY)

---

### 5. **Shift Swaps** (Partially FREE)
**Why**: Common feature, but limit complexity
- ✅ Request swaps (FREE: Yes)
- ✅ Approve/reject swaps (FREE: Yes)
- ❌ Bulk swap management (PAID ONLY)
- ❌ Swap analytics (PAID ONLY)

---

### 6. **Compliance & Tracking** (Partially FREE)
**Why**: Valuable but can be premium
- ✅ View basic hours (FREE: Yes)
- ✅ View own compliance (FREE: Yes)
- ❌ Overtime alerts (PAID ONLY)
- ❌ CSV export (PAID ONLY)
- ❌ Advanced compliance reports (PAID ONLY)

---

### 7. **Analytics** (PAID ONLY)
**Why**: High value, clear upgrade driver
- ❌ Analytics dashboard (FREE: No, PAID: Yes)
- ❌ Time saved metrics (PAID ONLY)
- ❌ Performance insights (PAID ONLY)
- ❌ Custom reports (PAID ONLY)

---

### 8. **Roles & Permissions** (Partially FREE)
**Why**: Basic RBAC should be free, advanced is premium
- ✅ Basic roles (FREE: System roles only)
- ❌ Custom roles (PAID ONLY)
- ❌ Advanced permissions (PAID ONLY)
- ❌ Role templates (PAID ONLY)

---

### 9. **Integrations & Export** (PAID ONLY)
**Why**: Enterprise feature, clear value
- ❌ CSV export (PAID ONLY)
- ❌ Payroll integration (PAID ONLY)
- ❌ API access (PAID ONLY)
- ❌ Webhooks (PAID ONLY)

---

### 10. **Schedule Limits** (FREE RESTRICTION)
**Why**: Natural usage limit
- ✅ Active schedules: FREE (1), PAID (Unlimited)
- ✅ Schedule history: FREE (30 days), PAID (Unlimited)
- ✅ Draft schedules: FREE (2), PAID (Unlimited)

---

## Recommended Freemium Structure

### FREE TIER
**Target**: Solo businesses, very small teams trying it out

**Limits:**
- 5 employees max
- 1 active schedule at a time
- 30 days of schedule history
- Basic email notifications only
- No AI features
- No analytics
- No CSV export
- System roles only (Admin, Manager, Employee)
- Basic shift swaps

**Features:**
- ✅ Core scheduling (drag-drop)
- ✅ Employee management (limited)
- ✅ Basic notifications
- ✅ View own schedule
- ✅ Request shift swaps

---

### STARTER ($19/month)
**Target**: Small businesses (5-15 employees)

**Everything in FREE, plus:**
- 15 employees
- Unlimited active schedules
- Unlimited schedule history
- AI schedule suggestions
- Overtime alerts
- Basic analytics
- CSV export
- Custom roles (up to 3)
- SMS notifications

---

### GROWTH ($39/month)
**Target**: Growing businesses (15-30 employees)

**Everything in STARTER, plus:**
- 30 employees
- Advanced AI features (recommendations, optimization)
- Advanced analytics dashboard
- Unlimited custom roles
- Push notifications
- Bulk operations
- Priority support
- Advanced compliance reports

---

### PRO ($59/month)
**Target**: Established businesses (30-50 employees)

**Everything in GROWTH, plus:**
- 50 employees
- Payroll integrations
- API access
- Webhooks
- White-label options
- Dedicated support
- Custom onboarding

---

## Upgrade Triggers (What drives conversions)

### Natural Upgrade Points:
1. **Employee Limit Hit**: "You've reached 5 employees. Upgrade to add more."
2. **AI Feature Discovery**: "Try AI scheduling suggestions - Upgrade to Starter"
3. **Export Need**: "Export payroll data - Available in Starter plan"
4. **Analytics Interest**: "View detailed analytics - Available in Starter plan"
5. **Multiple Schedules**: "Create unlimited schedules - Upgrade to Starter"
6. **Custom Roles**: "Create custom roles - Available in Starter plan"

---

## Implementation Strategy

### 1. **Soft Limits** (Show warnings, don't block)
- Employee count: Show upgrade prompt at 4/5 employees
- Schedule count: Allow creating but show upgrade prompt

### 2. **Hard Limits** (Block action)
- Employee creation: Block at 5 employees
- AI features: Show upgrade modal
- Export: Show upgrade modal

### 3. **Feature Gating**
- Hide premium features with "Upgrade" badges
- Show feature comparison table
- In-app upgrade prompts at key moments

### 4. **Trial Period**
- 14-day free trial of Starter features
- Auto-downgrade to Free after trial
- Send upgrade reminders before trial ends

---

## Revenue Optimization Tips

1. **Annual Billing**: Offer 20% discount (2 months free)
2. **Trial Conversion**: Email sequence during trial
3. **Usage-Based Upsells**: "You're using X schedules, upgrade for unlimited"
4. **Feature Discovery**: Showcase paid features in free tier UI
5. **Referral Program**: Free month for referrals
