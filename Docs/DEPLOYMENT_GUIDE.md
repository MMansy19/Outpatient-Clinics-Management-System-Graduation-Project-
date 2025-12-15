# MediStream OCMS - Deployment Guide

## Production URL
🚀 **Live Site:** https://medistream-ocms.vercel.app

## Quick Deploy to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Environment Variables (Vercel Dashboard)

Add these environment variables in your Vercel project settings:

```env
NEXT_PUBLIC_SITE_URL=https://medistream-ocms.vercel.app
BACKEND_API_URL=https://api-gateway.yellowgrass-a3ce385a.westeurope.azurecontainerapps.io/api/v1
NEXT_PUBLIC_API_BASE_URL=/api/proxy
NODE_ENV=production
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "SEO optimization and production setup"
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Vercel will automatically detect the push
   - Build and deploy will start automatically
   - Check deployment status in Vercel dashboard

3. **Verify Deployment**
   - Visit: https://medistream-ocms.vercel.app/en
   - Test: https://medistream-ocms.vercel.app/ar
   - Check sitemap: https://medistream-ocms.vercel.app/sitemap.xml
   - Check robots: https://medistream-ocms.vercel.app/robots.txt

### Manual Deploy (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

### SEO Setup
- [ ] Verify Google Search Console
- [ ] Submit sitemap to Google
- [ ] Set up Google Analytics
- [ ] Configure social media OG images
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Card Validator

### Testing
- [ ] Test English version (https://medistream-ocms.vercel.app/en)
- [ ] Test Arabic version (https://medistream-ocms.vercel.app/ar)
- [ ] Verify login page (https://medistream-ocms.vercel.app/en/login)
- [ ] Check responsive design
- [ ] Test PWA installation
- [ ] Verify API connectivity

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test page load speed
- [ ] Verify image optimization

### Security
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure security headers
- [ ] Test CORS settings
- [ ] Verify API proxy

## SEO Files Created

1. **[.env.production](../.env.production)** - Production environment variables
2. **[app/robots.ts](../app/robots.ts)** - Dynamic robots.txt generator
3. **[app/sitemap.ts](../app/sitemap.ts)** - Dynamic sitemap generator
4. **[public/robots.txt](../public/robots.txt)** - Static robots file (fallback)
5. **[app/opengraph-image.tsx](../app/opengraph-image.tsx)** - OG image generator
6. **[docs/SEO_OPTIMIZATION.md](./SEO_OPTIMIZATION.md)** - Complete SEO guide

## Updated Files

1. **[.env.local](../.env.local)** - Added NEXT_PUBLIC_SITE_URL
2. **[app/layout.tsx](../app/layout.tsx)** - Enhanced metadata + JSON-LD
3. **[app/[locale]/layout.tsx](../app/[locale]/layout.tsx)** - Locale-specific metadata
4. **[public/manifest.json](../public/manifest.json)** - PWA manifest updated

## Key URLs

### Production
- **English:** https://medistream-ocms.vercel.app/en
- **Arabic:** https://medistream-ocms.vercel.app/ar
- **Login:** https://medistream-ocms.vercel.app/en/login
- **Sitemap:** https://medistream-ocms.vercel.app/sitemap.xml
- **Robots:** https://medistream-ocms.vercel.app/robots.txt

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Environment Variables Not Working
- Check Vercel dashboard > Settings > Environment Variables
- Ensure variables are set for "Production"
- Redeploy after adding variables

### SEO Not Updating
- Clear browser cache
- Use incognito mode
- Check meta tags in browser dev tools
- Verify with online SEO tools

### Images Not Loading
- Check Image domains in next.config.ts
- Verify image paths
- Check Vercel logs for errors

## Monitoring

### Analytics Setup
1. Google Analytics 4
2. Google Search Console
3. Vercel Analytics (built-in)

### Performance Monitoring
- Vercel Speed Insights
- Lighthouse CI
- Web Vitals tracking

## Support

For issues:
1. Check Vercel deployment logs
2. Review [SEO_OPTIMIZATION.md](./SEO_OPTIMIZATION.md)
3. Consult Next.js documentation

## Next Steps

1. ✅ Deploy to production
2. ✅ Verify SEO setup
3. 📋 Add Google verification code
4. 📋 Submit to search engines
5. 📋 Set up analytics
6. 📋 Monitor performance
7. 📋 Create content strategy

---

**Last Updated:** December 16, 2025
**Version:** 1.0.0
**Production URL:** https://medistream-ocms.vercel.app
