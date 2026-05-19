# Phase 20 — Guest checkout manual checklist

Incognito / logged out.

- [ ] PDP: «Додати в кошик» — **без** редіректу на `/uviity`
- [ ] Header: іконка кошика з badge
- [ ] `/koszyk`: товари з localStorage, «Оформити»
- [ ] `/zamovlennia`: ім’я + телефон (10–15 цифр) + доставка
- [ ] Submit → `/zamovlennia/pidtverdzhennia/ASL-…` з сумою
- [ ] Після submit pending cart очищений
- [ ] Logged-in: add → DB cart; checkout як раніше
- [ ] Login з pending items → merge у кошик (якщо були в LS до входу)
