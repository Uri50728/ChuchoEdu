-- Seed some demo teachers and courses so the landing/dashboard has content.

insert into public.teachers (name, bio, specialty, avatar_url) values
  ('María González', 'Diseñadora UX con 10 años de experiencia guiando equipos de producto.', 'Diseño UX/UI', null),
  ('Carlos Ramírez', 'Ingeniero de software senior especializado en desarrollo web moderno.', 'Desarrollo Web', null),
  ('Ana Torres',     'Especialista en marketing digital y crecimiento orgánico para PyMEs.', 'Marketing Digital', null)
on conflict do nothing;

insert into public.courses (title, slug, description, category, level, is_published, teacher_id)
select
  t.title, t.slug, t.description, t.category, t.level, true,
  (select id from public.teachers where name = t.teacher_name limit 1)
from (values
  ('Fundamentos de Diseño UX',     'fundamentos-ux',           'Aprende los principios clave del diseño centrado en el usuario, desde la investigación hasta los prototipos interactivos.', 'Diseño',    'beginner',     'María González'),
  ('React Moderno desde Cero',     'react-moderno',            'Domina React 19, Server Components y las mejores prácticas para aplicaciones web escalables.',                             'Desarrollo','intermediate','Carlos Ramírez'),
  ('Marketing Digital para PyMEs', 'marketing-digital-pymes',  'Estrategias prácticas de SEO, contenido y redes sociales para hacer crecer tu negocio.',                                   'Marketing', 'beginner',     'Ana Torres')
) as t(title, slug, description, category, level, teacher_name)
on conflict (slug) do nothing;
