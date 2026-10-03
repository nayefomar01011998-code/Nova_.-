# NOVA — AI Voice & Business Agent (MVP)

هذه النسخة هي **نواة قابلة للنشر** من NOVA:
- لوحة تحكم تعمل من الهاتف.
- محادثة تجريبية.
- حجز مواعيد.
- health check.
- WhatsApp webhook verification/receiver.
- متغيرات بيئة جاهزة للربط مع Meta وموفر الذكاء الاصطناعي.

## مهم

هذه ليست بعد مكالمات WhatsApp الحقيقية. المكالمات الفعلية تحتاج:
1. Meta Business Portfolio.
2. WhatsApp Business Account.
3. رقم WhatsApp Business.
4. تفعيل/صلاحيات WhatsApp Business Platform وCalling API المتاحة لحسابك.
5. مزود/محرك صوت لحظي وربطه بالـbackend.
6. مفاتيح API في متغيرات البيئة.

لا تضع مفاتيح API داخل GitHub أو داخل الكود.

## تشغيل محلي

```bash
npm install
npm start
```

ثم افتح:
`http://localhost:3000`

## نشر على Railway

1. ارفع هذا المشروع إلى GitHub كمستودع خاص.
2. افتح Railway وأنشئ مشروعًا جديدًا من GitHub.
3. اختر المستودع.
4. أضف متغيرات البيئة من `.env.example`.
5. Generate Domain.
6. استخدم:
`https://YOUR-DOMAIN/webhooks/whatsapp`
كعنوان webhook عند إعداد Meta.

Railway يكتشف تطبيقات Node/Express تلقائيًا، ويمكنه إنشاء نطاق عام للمشروع.

## التطوير التالي

- ربط WhatsApp Cloud API للرسائل.
- ربط WhatsApp Calling API.
- محرك صوت لحظي متعدد اللغات.
- أدوات التقويم.
- CRM/قاعدة بيانات دائمة.
- متجر NOVAORA.
- تحويل المكالمة للبشر.
- تسجيل ملخص المكالمة مع سياسات الخصوصية والموافقة المناسبة.
