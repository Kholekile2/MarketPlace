# GitHub Copilot Instructions for SA Marketplace Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a Next.js marketplace platform designed specifically for young South African entrepreneurs to formalize their informal businesses. The platform helps sellers transition from social media-based operations to professional business management.

## Key Business Context
- **Target Users**: Young South African entrepreneurs selling weaves, iPhones, clothing, and providing loans
- **Current State**: Users currently advertise on social media (Facebook, Instagram, WhatsApp)
- **Platform Goal**: Provide business infrastructure without competing with their advertising channels
- **Currency**: All amounts should be in South African Rand (ZAR) format: "R 1,234.56"
- **Compliance**: Must consider POPIA (Protection of Personal Information Act) requirements

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## Code Style Guidelines
- Use TypeScript for all new components and utilities
- Follow Next.js 13+ App Router patterns
- Use Tailwind CSS classes for styling
- Implement mobile-first responsive design
- Use Prisma for database operations
- Follow React hooks best practices

## Business Logic Patterns
- **Contracts**: Support product sales, service agreements, and loan agreements
- **Invoices**: Include QR codes for payments, VAT calculations, and South African tax compliance
- **Orders**: Track status from "Pending" through "Delivered" with SMS notifications
- **Customers**: Import from social media platforms, track purchase history
- **Analytics**: Focus on revenue, popular products, and customer insights

## Naming Conventions
- Use descriptive component names: `ContractGenerationForm`, `InvoiceStatusBadge`
- Database models follow Prisma conventions: `User`, `Customer`, `Invoice`
- File names use kebab-case: `contract-templates.tsx`, `invoice-utils.ts`
- API routes follow RESTful patterns: `/api/contracts`, `/api/invoices/[id]`

## South African Localization
- Format currency as "R 1,234.56" (Rand symbol + space + amount)
- Use South African phone number format: "+27 82 123 4567"
- Consider local business practices and terminology
- Implement POPIA-compliant data handling

## Security Considerations
- Validate all user inputs
- Implement proper authentication checks
- Follow POPIA data protection requirements
- Use environment variables for sensitive configuration
- Implement proper error handling without exposing system details

## Mobile-First Design
- All components must work well on mobile devices
- Use responsive Tailwind classes (sm:, md:, lg:)
- Consider touch interfaces and smaller screens
- Optimize for South African mobile network conditions

## Integration Points
- SMS services for customer notifications
- Email services for invoice delivery
- Social media APIs for customer import
- Payment gateway integrations for South African market
- QR code generation for payment collection

When generating code, prioritize:
1. **User Experience**: Simple, intuitive interfaces for non-technical users
2. **Mobile Optimization**: Smartphone-first design approach
3. **Local Context**: South African business practices and regulations
4. **Scalability**: Code that can grow with the business
5. **Accessibility**: Inclusive design for diverse user base
