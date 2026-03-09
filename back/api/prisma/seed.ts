import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultPages = [
  {
    slug: 'offer',
    title: { ru: 'Публичная оферта', en: 'Terms of Service' },
    content: {
      ru: '<h2>Публичная оферта</h2><p>Настоящий документ является публичной офертой сервиса Darba AI Studio. Используя сервис, вы принимаете условия данной оферты.</p><p>Подробные условия будут опубликованы позднее.</p>',
      en: '<h2>Terms of Service</h2><p>This document constitutes the public offer of Darba AI Studio service. By using the service, you accept the terms of this offer.</p><p>Detailed terms will be published later.</p>',
    },
    sortOrder: 1,
  },
  {
    slug: 'privacy',
    title: { ru: 'Политика конфиденциальности', en: 'Privacy Policy' },
    content: {
      ru: '<h2>Политика конфиденциальности</h2><p>Darba AI Studio обрабатывает персональные данные в соответствии с законодательством РФ (ФЗ-152). Мы не передаём данные третьим лицам без вашего согласия.</p>',
      en: '<h2>Privacy Policy</h2><p>Darba AI Studio processes personal data in accordance with applicable law. We do not share your data with third parties without your consent.</p>',
    },
    sortOrder: 2,
  },
  {
    slug: 'disclaimer',
    title: { ru: 'Отказ от ответственности', en: 'Disclaimer' },
    content: {
      ru: '<h2>Отказ от ответственности</h2><p>AI-генерация может содержать неточности. Результаты работы AI-агентов предоставляются «как есть». Darba не несёт ответственности за использование сгенерированного контента.</p>',
      en: '<h2>Disclaimer</h2><p>AI generation may contain inaccuracies. Results from AI agents are provided "as is". Darba is not responsible for the use of generated content.</p>',
    },
    sortOrder: 3,
  },
];

async function main() {
  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
    console.log(`Seeded page: ${page.slug}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
