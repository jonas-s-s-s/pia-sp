# PIA SP 2025

## Obsah

- [Obsah](#obsah)
- [Popis projektu](#popis-projektu)
- [Použité technologie](#použité-technologie)
- [Struktura projektu](#struktura-projektu)
- [Spuštění](#spuštění)
- [Spuštění testů](#spuštění-testů)
- [Ukázka použití](#ukázka-použití)
- [Další ukázky](#další-ukázky)

## Popis projektu

Implementováno na základě:

https://github.com/fidransky/kiv-pia-labs/wiki/Semester-project

Implementována byla webová aplikace pro překlad dokumentů, obsahující tři uživatelské role: Customer, Translator a Administrator. Každá z těchto rolí je zodpovědná za jinou "fázi" projektu.

Aplikace využívá hybridní přístup skládající se z Server Side Rendering a potom React komponent na frontendu. Backend pošle statické části stránky, a hydratuje react komponenty pokud mají nastaven parametr `client:load`, tyto komponenty pak řeší veškeré client-side JavaScript interakce s uživatelem.

Všechna uživatelská data a informace o projektech jsou ukládány v PostgreSQL, pro ukládání souborů byl využit S3-compatible object storage **MinIO**.

Web umožňuje uživateli měnit jazyk kliknutím na tlačítko **Czech** nebo **English** v zápatí stránky.

## Použité technologie

- Framework: 
  - Astro (https://astro.build/)
- ORM: 
  - DrizzleORM (https://orm.drizzle.team/)
- Úložiště
  - PostgreSQL
  - MinIO (https://www.min.io/)
- Login systém
  - Better Auth (https://www.better-auth.com/)
- Frontend:
  - React
  - Tailwind
- Testing framework
  - Vitest (https://vitest.dev/)
- Ostatní závislosti:
  - AWS SDK (S3 klient)
  - astro-icons a iconify-json (ikony v UI)
  - nodemailer (odesílání malů)
  
## Struktura projektu

V kořenovém adresáři projektu se nacházejí dvě hlavní složky:

- `src`
  - Zdrojové soubory aplikace
- `test`
  - Unit testy a integrační testy

Dalé jsou v kořenovém adresáři následující konfigurační soubory:

- `.env.development`
  - proměnné prostředí pro spuštění aplikace mimo docker
- `.env.docker`
  - proměnné prostředí předané když je aplikace spuštěna v docker kontejneru
  - toto rozdělení je důležité, protože když je v kontejneru, tak již nemůže k ostatním službám přistupovat přes localhost, místo toho musí využít docker network
- `astro.config.mjs`
  - konfigurace astro frameworku
- `auth.ts`
  - konfigurace pro Better Auth
  - nastavení secrets, způsobu přihlašování uživatelů, uživatelských rolí, apod.
  - umožňuje přihlášení i přes GitHub OAuth, tyto secrets jsem ale z env souborů odstranil, aby nebyly ve veřejném Git repozitáři
- `docker-compose.yml`
  - hlavní compose soubor pro tuto aplikaci
- `drizzle.config.ts`
  - nastavení DrizzleORM
- `env.d.ts`
  - nastavení astro.locals, tedy datového objektu který je nastavován v middleware 
- `vitest.config.ts`
  - nastavení testovacího frameworku

Obsah složky src je pak následujcí:

- `actions`
  - Astro Actions, specifikace RPC API
  - V `actions/index.ts` je definován hlavní objekt, do kterého jsou pomocí parametrů předány Actions objekty definované v ostatních souborech 
- `components`
  - UI komponenty, buď React (.tsx) nebo Astro (.astro), výhoda Astro komponent je, že jsou kompletně renderované na serveru (přirozené ale omezenějí použití frontend JS)
- `db`
  - Databáze
  - V souboru orm.ts je definován hlavní ORM objekt, nad kterým je možné provádět SQL dotazy
  - Složka `schemas` obsahuje definice tabulek
  - Ve složce `data_access` se nacházejí funkce pro modifikaci nebo čtení dat z databáze, toto je jediné místo v aplikaci, kde je ORM objekt volán na přímo, díky tomu lze tyto funkce pak snadno mockovat v unit testech
  - DrizzleORM je podobné spíše klasickému SQL než například Java ORM frameworkům. Výsledkem DrizzleORM dotazu je datový objekt, jehož typ je automaticky detekován IDE a kontrolován TypeScript language serverem.
- `i18n`
  - i18n = internationalization
  - Dva soubory umožňující překlad textu v UI komponentách
  - Bez jakékoliv modifikace lze využít úplně stejně jak na frontendu, tak na backendu.
- layouts
  - "kostra" webu která se nemění napříč stránkami, tedy záhlaví, zápatí, apod.
- `lib_backend`
  - knihovna funkcí určená pro použití na backendu
  - Složka `project` obsahuje business logiku ohledně přidělování projektu, voláno z Actions
  - `user_roles` obsahuje definici uživatelských rolí a jejich oprávnění
  - `email.ts` obsahuje funkce pro odesílání emailů
  - `objectStorage.ts` je soubor obsahující funkce pro přístup a modifikaci MinIO úložiště
- `lib_frontend`
  - Funkce pro použití na frontendu
  - Logicky je lze použít také na backendu, pokud je to vhodné
  - Důležitý je zde soubor `AuthClient.ts`, který obsahuje funkce volající Better Auth endpoit
- `middleware`
  - Middleware je spuštěn jako první při každém HTTP requestu, je zde implementována autentizace uživatele, objektu `User` který je v middleware uložen do Astro.locals pak mohou využívat ostatní části aplikace
- `pages`
  - Obsahuje stránky ze kterých je tvořený web
  - Astro používá tzv. file-based routing, tedy obsah této složky určuje strukturu URL
  - Složka `api` uvnitř této složky je výše zmiňovaný Better Auth endpoint
- `styles`
  - Tailwind global stylesheet
  - Tento stylesheet je importován uvnitř layoutu

## Spuštění

- Aplikaci lze spustit pomocí docker compose, navíc je ale potřeba vytvořit databázové tabulky pomocí drizzle-kit
- Protože Drizzle tabulky nevytváří automaticky

Příkazy pro spuštění aplikace tedy jsou:
```
docker compose up
```

Poté co je kontejner s databází spuštěn proveďte v tomto adresáři příkay:
```
npm install
npm drizzle-kit push
```

Po provedení by měla být databáze inicializována a aplikace funkční fuknční.

Webové rozhraní je na `localhost:80`, GUI mail serveru je na `localhost:8080`, MinIO GUI je na `localhost:9001`.

## Spuštění testů

Poté, co bylo provedeno npm install lze testy spustit v tomto adresáři následujícím příkazem:
```
vitest ./test
```

## Ukázka použití

Tato sekce vysvětluje, jak byly implementovány jednotlivé body zadání, včetně ukázky toho, kde se příslušná funkcionalita nachází

1) **Customer creates translation projects in the service, submitting source files (any file type) in English**
- Vytvoříme nového uživatele, jehož role je Customer
- Na hlavní stránce klikneme na "New Project"
- Uživatel nyní může nahrát soubor, poté co ho nahraje je nejdřív vytvořen nový projekt, pak je mu přiřazen soubor a překladatel

<img src="./docs/img.png" width="600">

2) **Service finds suitable translator for given project based on the target language, assigns the project and notifies the translator via email; if no translator is found, service closes the project and notifies the customer via email**
- Na frontendu je to provedeno v jednom kroku, když uživatel nahraje soubor
- Frontend volá `createProject` uvnitř `/actions/customer.ts`

3) **Translator completes the project, service notifies the customer via email**
- Action `uploadTranslatedFile` uvnitř `/actions/translator.ts`
- Interně volá funkci pro odeslání mailu, poté co je soubor úspěšně nahraný

4) **Customer approves/rejects completed translations and submits feedback to the project**
- Pro uživatele s rolí Customer je to tlačítko na hlavní stránce "Review Projects"
- Volá actions uvnitř `actions/customer.ts`

<img src="./docs/img_1.png" width="600">

5) **Administrator resolves customer feedback, sending messages to customer/translator and ultimately closing the whole project**
- Uživatel role Administrator vidí na hlavní stránce pod názvem "Admin Project Viewer"
- Náhled ukazuje všechny projekty, co mají přiřazený nějaký feedback, dále je umožňuje filtrovat
- Admin uživatele **nelze vytvořit přes webové UI, uživateli třeba manuálně v databázi nastavit roli Administrator** (tabulka Users)

Pro změnu role použijtě tyto příkazy (se spuštěným Potgres kontejnerem):
```
docker exec -it postgres psql -U myuser -d mydatabase

UPDATE "user" SET role = 'Administrator' WHERE email = '<email_uživatele>@example.com';

SELECT id, email, role FROM "user" WHERE email = '<email_uživatele>@example.com';
```

<img src="./docs/img_2.png" width="600">

# Další ukázky

<img src="./docs/img_3.png" width="800">

<img src="./docs/img_4.png" width="800">

<img src="./docs/img_5.png" width="800">

<img src="./docs/img_6.png" width="800">

<img src="./docs/img_7.png" width="800">

<img src="./docs/img_8.png" width="800">

<img src="./docs/img_9.png" width="800">

<img src="./docs/img_10.png" width="800">

<img src="./docs/docker.png" width="800">

<img src="./docs/smtp.png" width="600">
