# Feature Research

**Domain:** Used-appliance single-store e-commerce (Lviv)
**Researched:** 2026-05-16
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product listing with photos | Can't buy blind | MEDIUM | Cloudinary, multiple images |
| Category navigation | Find washers vs fridges | LOW | Seed 8 categories + admin CRUD |
| Search + filters | Price/brand/condition compare | MEDIUM | URL-synced filters |
| Product detail page | Specs, condition, price | LOW | Condition enum critical for used |
| Shopping cart | Multi-item purchase | MEDIUM | Session or user-bound cart |
| Checkout flow | Complete purchase intent | MEDIUM | No online pay v1 — status + contact |
| Contact / chat with store | Questions on used goods | HIGH | Realtime expected |
| Mobile-responsive UI | Most traffic mobile | MEDIUM | Tailwind + shadcn |
| Admin product management | Store updates inventory | MEDIUM | Full CRUD |
| Order management (admin) | Store fulfills orders | MEDIUM | Status workflow |
| Ukrainian language | Local market | LOW | copy + `uk` metadata |
| Delivery / pickup choice | Lviv logistics | LOW | Enum at checkout |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Airy, premium-light UI | Trust for used goods | MEDIUM | Design system tokens |
| Rich condition grading | Reduces returns/disputes | LOW | Photos + grade label |
| Live chat while browsing | Closes high-consideration sales | HIGH | Pusher + admin inbox |
| Local SEO (Lviv) | Organic local traffic | MEDIUM | Structured data, area copy |
| Fast filter UX | Find appliance in seconds | MEDIUM | nuqs + indexed DB |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Online payment day 1 | Convenience | Scope, legal, refunds on used | Offline payment + order notes |
| Marketplace multi-seller | Scale | Wrong business model | Single admin |
| AI price estimation | Cool | Wrong data, liability | Manual admin pricing |
| Native mobile app | Reach | Cost | PWA-ready responsive web |
| Guest checkout without phone | Speed | Can't deliver/callback | Phone required at checkout |

## Feature Dependencies

```
Auth (optional browse)
    └──requires──> Cart (logged in)
                       └──requires──> Checkout
                                              └──requires──> Orders (admin)
Catalog + Categories
    └──requires──> Search/Filters
    └──requires──> Product detail
Chat
    └──requires──> Auth (buyer)
    └──requires──> Admin inbox
Admin CRUD
    └──requires──> Auth (admin role)
```

## MVP Recommendation

User requested **full MVP** in one release. Sequence by vertical slices:

1. Foundation + catalog browse (public)
2. Cart + checkout + orders
3. Admin (products, categories, orders)
4. Realtime chat

## v2 Candidates

- Online payment (LiqPay/Monobank)
- Email/SMS order notifications
- Wishlist / compare
- Reviews
- Delivery outside Lviv
- Analytics dashboard

## Implications for Requirements

- Every table-stakes row → v1 REQ
- Payment integration → Out of Scope
- Marketplace → Out of Scope
