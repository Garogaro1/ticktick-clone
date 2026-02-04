# Production Readiness Checklist

Use this checklist to ensure the application is production-ready.

## Security

### Authentication & Authorization

- [ ] Strong NEXTAUTH_SECRET configured (not default value)
- [ ] Session timeout configured appropriately
- [ ] Password hashing implemented (bcrypt)
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed attempts

### Data Protection

- [ ] Input validation on all API endpoints (Zod schemas)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection on state-changing operations
- [ ] File upload restrictions (if applicable)

### Security Headers

- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy set
- [ ] Permissions-Policy configured

### API Security

- [ ] CORS policy configured
- [ ] Rate limiting on public endpoints
- [ ] API authentication required
- [ ] Error messages don't leak sensitive info
- [ ] Request size limits configured

## Performance

### Frontend

- [ ] Code splitting implemented
- [ ] Dynamic imports for heavy components
- [ ] Image optimization enabled (Next.js Image)
- [ ] Font optimization enabled
- [ ] Lazy loading for below-fold content
- [ ] Bundle size optimized (< 500KB initial)

### Backend

- [ ] Database indexes on frequently queried fields
- [ ] Connection pooling configured
- [ ] Response compression enabled
- [ ] Caching strategy implemented
- [ ] Background jobs for long-running tasks

### Monitoring

- [ ] Application performance monitoring (APM)
- [ ] Error tracking configured
- [ ] Real user monitoring (RUM)
- [ ] Uptime monitoring
- [ ] Log aggregation

## Reliability

### Error Handling

- [ ] Global error boundary implemented
- [ ] API error handling consistent
- [ ] Graceful degradation for feature failures
- [ ] User-friendly error messages
- [ ] Error logging configured

### Data Integrity

- [ ] Database migrations tested
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Data validation at boundaries
- [ ] Transaction support for critical operations

### Availability

- [ ] Health check endpoint (`/api/health`)
- [ ] Load balancing configured (if applicable)
- [ ] Auto-scaling configured (if applicable)
- [ ] CDN for static assets
- [ ] Database failover configured (if applicable)

## SEO & Accessibility

### SEO

- [ ] Meta titles and descriptions unique per page
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Structured data (JSON-LD) implemented
- [ ] Canonical URLs set

### Accessibility

- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Color contrast meets standards
- [ ] ARIA labels on interactive elements
- [ ] Skip links implemented

### Mobile

- [ ] Responsive design tested on devices
- [ ] Touch targets >= 44x44px
- [ ] Viewport configured correctly
- [ ] Text readable without zoom
- [ ] Horizontal scrolling avoided

## Compliance & Legal

### Privacy

- [ ] Privacy policy page created
- [ ] Terms of service created
- [ ] Cookie consent implemented (if using tracking)
- [ ] Data retention policy documented
- [ ] User data export functionality
- [ ] Account deletion functionality

### GDPR (if applicable)

- [ ] Lawful basis for data processing
- [ ] Data subject rights implemented
- [ ] Data protection impact assessment
- [ ] Data processing agreement with vendors
- [ ] Cookie consent with granular options

## Deployment

### Infrastructure

- [ ] Environment variables configured
- [ ] Secrets not in code repository
- [ ] Database backup automated
- [ ] SSL/TLS certificate configured
- [ ] Domain configured with DNS
- [ ] CDN configured (if applicable)

### Monitoring & Alerting

- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Uptime alerts configured
- [ ] On-call rotation defined
- [ ] Runbooks created for common issues

### Documentation

- [ ] Deployment guide documented
- [ ] API documentation created
- [ ] Troubleshooting guide available
- [ ] Architecture documentation up to date
- [ ] Runbooks for incidents

## Testing

### Automated Tests

- [ ] Unit tests for critical logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Performance tests (load testing)
- [ ] Security tests (OWASP ZAP, etc.)

### Manual Testing

- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Accessibility audit completed
- [ ] Security audit completed
- [ ] User acceptance testing

## Launch Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Performance budgets met
- [ ] Security audit passed
- [ ] Legal review completed
- [ ] Stakeholder sign-off

### Launch Day

- [ ] DNS configured and propagated
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backup verified
- [ ] Rollback plan documented

### Post-Launch

- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Review analytics data
- [ ] Gather user feedback
- [ ] Plan iteration cycle
