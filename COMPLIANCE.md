# Compliance & Legal Framework

**Document Version**: 1.0  
**Last Updated**: October 29, 2025  
**Status**: Phase 1 Milestone 6.4 (PRODUCTION_HARDENING_ROADMAP.md)

## Overview

This document outlines ViberDoc's data handling, retention, privacy, and content policies to ensure compliance with legal requirements and industry best practices.

---

## Data Retention Policies

### User Data

| Data Type | Retention Period | Rationale |
|-----------|------------------|-----------|
| **User Accounts** | Active + 90 days after deletion request | Allow account recovery period |
| **Generated Documentation** | Active + 30 days after user deletion | Fulfill contractual obligations |
| **Crawl History** | 60 days | Audit trail and debugging |
| **API Logs** | 90 days | Security monitoring and compliance |
| **Analytics Data** | 365 days (aggregated) | Product improvement and reporting |
| **Payment Records** | 7 years | Tax and legal requirements |
| **Support Tickets** | 3 years | Customer service quality |

### Automated Deletion

**Implementation**: `server/data-retention.ts`

```typescript
// Automated cleanup jobs (runs daily at 2 AM UTC)
cron.schedule('0 2 * * *', async () => {
  // Delete accounts marked for deletion > 90 days ago
  await deleteExpiredAccounts();
  
  // Delete crawl history > 60 days old
  await deleteCrawlHistory({ olderThan: 60 });
  
  // Delete API logs > 90 days old
  await deleteLogs({ olderThan: 90 });
  
  // Anonymize analytics data > 365 days old
  await anonymizeAnalytics({ olderThan: 365 });
});
```

### User-Initiated Deletion

**Right to Erasure** (GDPR Article 17):

```sql
-- Immediate anonymization on deletion request
UPDATE users 
SET email = 'deleted-' || id || '@anonymized.local',
    name = 'Deleted User',
    deleted_at = NOW()
WHERE id = $1;

-- Mark dependent data for deletion (90-day grace period)
UPDATE documentations 
SET deletion_scheduled_at = NOW() + INTERVAL '90 days'
WHERE user_id = $1;
```

---

## GDPR Compliance

### Data Controller Information

**Entity**: ViberDoc Inc.  
**Contact**: privacy@viberdoc.app  
**DPO**: dpo@viberdoc.app  

### Legal Basis for Processing

| Purpose | Legal Basis |
|---------|-------------|
| Account creation | Contract (GDPR Art. 6.1b) |
| Documentation generation | Contract (GDPR Art. 6.1b) |
| Analytics | Legitimate interest (GDPR Art. 6.1f) |
| Marketing emails | Consent (GDPR Art. 6.1a) |

### User Rights

ViberDoc supports all GDPR user rights:

1. **Right to Access** (Art. 15)
   - Endpoint: `GET /api/users/me/data-export`
   - Response time: 30 days (legal maximum)
   - Format: JSON download

2. **Right to Rectification** (Art. 16)
   - Endpoint: `PATCH /api/users/me`
   - Immediate update of account information

3. **Right to Erasure** (Art. 17)
   - Endpoint: `DELETE /api/users/me`
   - 90-day grace period before permanent deletion

4. **Right to Data Portability** (Art. 20)
   - Endpoint: `GET /api/users/me/data-export?format=json`
   - Includes: Account data, generated docs, settings

5. **Right to Object** (Art. 21)
   - Marketing emails: Unsubscribe link in every email
   - Analytics: Opt-out in account settings

### Data Processing Agreements

**Third-Party Processors**:

| Service | Purpose | DPA Status | Data Location |
|---------|---------|------------|---------------|
| Supabase | Database hosting | ✅ Signed | US (SOC 2) |
| OpenAI | AI generation | ✅ Signed | US |
| Cloudflare | CDN & hosting | ✅ Signed | Global (EU data residency available) |
| Stripe | Payment processing | ✅ Signed | US (PCI DSS Level 1) |

### International Data Transfers

**EU to US transfers**: Standard Contractual Clauses (SCCs) with all processors

**Data Residency Options**:
- EU customers: Data stored in Supabase EU region (Frankfurt)
- Configuration: `DATABASE_REGION=eu-west-1`

---

## Privacy Policy

### Data Collection

**What we collect**:
- Email address, name (required for account)
- IP address (temporary, for rate limiting)
- Browser user-agent (temporary, for compatibility)
- URLs submitted for documentation generation
- Generated documentation content

**What we DON'T collect**:
- Passwords (hashed with bcrypt)
- Social security numbers
- Payment card details (handled by Stripe)
- Precise geolocation

### Third-Party Services

**AI Providers**:
- OpenAI GPT-4: Process submitted URLs and generate content
- Data sent: URL, extracted content, user preferences
- Data retained by provider: Per OpenAI's zero-retention API policy

**Analytics**:
- Self-hosted (privacy-preserving)
- No third-party trackers (Google Analytics, etc.)
- IP addresses anonymized before storage

### Cookies

| Cookie Name | Purpose | Duration | Essential |
|-------------|---------|----------|-----------|
| `session` | User authentication | 30 days | ✅ Yes |
| `csrf_token` | Security (CSRF protection) | Session | ✅ Yes |
| `theme` | UI preference | 1 year | ❌ No |

**Cookie Consent**: Required for non-essential cookies (theme preference)

---

## DMCA & Copyright Compliance

### Safe Harbor Provisions

ViberDoc qualifies for DMCA safe harbor (17 U.S.C. § 512) as a service provider:

1. **No actual knowledge** of infringing content
2. **No financial benefit** directly from infringement
3. **Expeditious removal** upon notice
4. **Designated agent** for takedown notices

### DMCA Takedown Process

**Designated Agent**:
```
ViberDoc Inc.
DMCA Agent
Email: dmca@viberdoc.app
Address: [Your business address]
```

**How to File**:

Submit via email with:
1. Your contact information
2. Identification of copyrighted work
3. Identification of infringing material (URL)
4. Good faith statement
5. Accuracy statement
6. Physical or electronic signature

**Our Response**:
- Acknowledge receipt: 24 hours
- Remove content: 48 hours
- Notify user: 72 hours
- User counter-notice period: 10-14 days

### Content Filtering

**Proactive Measures**:

```typescript
// server/content-filter.ts
export async function validateContent(url: string, content: string) {
  // Block known piracy sites
  if (isPiracySite(url)) {
    throw new Error('URL blocked: Known copyright infringement site');
  }
  
  // Check robots.txt Disallow
  if (!await isAllowedByCrawl(url)) {
    throw new Error('URL blocked: Disallowed by robots.txt');
  }
  
  // Respect DMCA pre-blocks
  if (await isDMCABlocked(url)) {
    throw new Error('URL blocked: DMCA takedown notice on file');
  }
}
```

### Counter-Notice Process

Users may submit counter-notice if they believe removal was in error:

1. Submit counter-notice with good faith statement
2. We forward to original complainant
3. If no court action within 10-14 days, content may be restored

---

## Terms of Service

### Prohibited Uses

Users may NOT:
- Crawl sites in violation of robots.txt
- Submit copyrighted content without permission
- Reverse-engineer the AI models
- Resell generated documentation without attribution
- Use service for illegal activities
- Bypass rate limits or usage quotas

### Content Ownership

**User Content**:
- You retain ownership of URLs you submit
- You grant us license to process and generate docs
- Generated docs are owned by you

**Generated Documentation**:
- ViberDoc claims no ownership
- You are responsible for legal use and attribution
- Must comply with original content licenses

### Liability Limitations

ViberDoc is not liable for:
- Accuracy of AI-generated content
- Copyright status of source material
- Third-party API outages (OpenAI, etc.)
- Indirect, consequential, or punitive damages

**Maximum Liability**: Lesser of (a) $100 or (b) amount paid in last 12 months

---

## Accessibility Compliance

### WCAG 2.1 Level AA

**Commitment**: ViberDoc aims to meet WCAG 2.1 Level AA standards

**Current Status**:
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility (ARIA labels)
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Resizable text up to 200%
- ⚠️ Ongoing: Alt text for all images

**Accessibility Statement**: Available at `/accessibility`

---

## Security & Breach Notification

### Incident Response

**Security Breach Definition**:
- Unauthorized access to user data
- Data exfiltration or loss
- Service compromise affecting confidentiality/integrity

**Response Timeline**:
1. **Detection → Containment**: 1 hour
2. **Assessment**: 4 hours
3. **User Notification**: 72 hours (GDPR requirement)
4. **Regulatory Notification**: 72 hours (if applicable)

**Notification Method**:
- Email to affected users
- Dashboard banner (in-app)
- Public disclosure (if >1000 users affected)

### Data Breach Register

All incidents logged in:
- **File**: `security/breach-register.md` (internal)
- **Retention**: 5 years
- **Contents**: Date, nature, impact, remediation

---

## Children's Privacy (COPPA)

**Age Requirement**: 13 years or older

**Verification**:
- Age checkbox during signup
- No collection of children's data
- Immediate account termination if under-age user detected

---

## Audit & Compliance Monitoring

### Annual Compliance Review

**Schedule**: Q1 of each year

**Scope**:
- Data retention policy enforcement (audit logs)
- GDPR rights request handling (response times)
- DMCA takedown compliance (response times)
- Security incident review (breach register)

### External Audits

**SOC 2 Type II** (planned):
- Vendor: [To be selected]
- Frequency: Annual
- Scope: Security, availability, confidentiality

---

## Regulatory Contacts

### Data Protection Authorities

**EU**: 
- Primary: Irish Data Protection Commission (Supabase is Irish entity)
- Email: info@dataprotection.ie

**US**:
- FTC Bureau of Consumer Protection
- Complaint portal: https://reportfraud.ftc.gov/

### Industry Contacts

**DMCA Agent Registry**:
- Copyright Office online directory: https://dmca.copyright.gov/osp/

---

## Policy Updates

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 29, 2025 | Initial compliance framework |

### Notification of Changes

Users will be notified 30 days before material changes via:
- Email to registered address
- Dashboard banner (in-app)
- Public changelog: `/legal/changelog`

**Continued use** after notification constitutes acceptance

---

## Contact Information

**Privacy Questions**: privacy@viberdoc.app  
**DMCA Notices**: dmca@viberdoc.app  
**Security Issues**: security@viberdoc.app  
**General Support**: support@viberdoc.app  

---

## Appendix A: Data Processing Record

*Article 30 GDPR*

| Processing Activity | Purpose | Legal Basis | Recipients | Retention |
|---------------------|---------|-------------|------------|-----------|
| User registration | Account management | Contract | Supabase | Active + 90 days |
| Documentation generation | Core service | Contract | OpenAI, Supabase | Active + 30 days |
| Payment processing | Billing | Contract | Stripe | 7 years |
| Email communications | Support & marketing | Consent/Contract | SendGrid | Until unsubscribe |
| Analytics | Service improvement | Legitimate interest | Internal only | 365 days |

---

## Appendix B: Standard Contractual Clauses

*For EU to US data transfers*

**SCC Module**: Controller to Processor (Module 2)  
**Version**: 2021 SCCs (European Commission Decision 2021/914)  
**Effective Date**: [To be completed upon production launch]  

**Data Importers**:
- Supabase Inc. (Database)
- OpenAI OpCo LLC (AI Processing)
- Stripe, Inc. (Payment Processing)

---

## References

- **GDPR**: https://gdpr-info.eu/
- **DMCA**: https://www.copyright.gov/legislation/dmca.pdf
- **COPPA**: https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **PRODUCTION_HARDENING_ROADMAP.md**: Phase 1 Milestone 6.4

---

**Document Approval**:
- Legal Review: [Pending]
- DPO Sign-off: [Pending]
- Executive Approval: [Pending]

**Next Review Date**: October 29, 2026
