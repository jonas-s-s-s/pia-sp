export const languages = {
    en: 'English',
    cz: 'Czech',
};

export const defaultLang = 'en';

export const ui = {
    en: {
        'index.welcome': 'Welcome',
        'index.sign_in': 'Sign in',
        'index.sign_up': 'Sign up',
        'index.continue_with_one_of_the_following': 'Continue with one of the following actions:',
        'footer.available_in_langs': 'Available in languages:',
        'my-profile.my_profile': "My Profile",
        'role-change.choose_role': 'Role Settings',
    },
    cz: {
        'index.welcome': 'Vítejte',
        'footer.available_in_langs': 'Dostupné v jazycích:',
        'index.continue_with_one_of_the_following': 'Pokračujte jednou z následujících akcí:',
        'index.sign_in': 'Přihlásit se',
        'index.sign_up': 'Registrovat se',
        'my-profile.my_profile': "Můj profil",
        'role-change.choose_role': 'Nastavení role',
    },
} as const;