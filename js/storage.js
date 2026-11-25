
(() => {
    const accounts = [
        {
            uid: "apresentacao-colaborador",
            email: "colaborador@rhconnect.com",
            password: "123456",
            name: "Colaborador",
            role: "colaborador",
            title: "Colaborador",
            department: "Operações"
        },
        {
            uid: "apresentacao-admin",
            email: "rh@rhconnect.com",
            password: "123456",
            name: "Administrador RH",
            role: "admin",
            title: "Administrador de RH",
            department: "Recursos Humanos"
        }
    ];

    const key = "rhconnect-apresentacao-employees";
    const session = "rhconnect-apresentacao-session";

    let user = null;

    const profile = a => {
        const { password, ...p } = a;
        return p;
    };

    const check = () => {
        if (user?.role !== "admin") {
            throw Error("Acesso restrito");
        }
    };

    window.RHStore = {
        enabled: true,

        async login(email, password, remember) {
            const a = accounts.find(
                a => a.email === email.toLowerCase()
                    && a.password === password
            );

            if (!a) {
                throw Error("Credenciais inválidas");
            }

            user = a;
            sessionStorage.setItem(session, a.uid);

            return profile(a);
        },

        async restore() {
            user = accounts.find(
                a => a.uid === sessionStorage.getItem(session)
            ) || null;

            return user ? profile(user) : null;
        },

        async logout() {
            user = null;
            sessionStorage.removeItem(session);
        },

        async reset() {
            throw Error(
                "Recuperação indisponível na apresentação"
            );
        },

        async load() {
            check();
            return JSON.parse(
                localStorage.getItem(key) || "[]"
            );
        },

        async add(record) {
            check();

            const rows = await this.load();

            const i = rows.findIndex(
                r => r.email.toLowerCase() ===
                     record.email.toLowerCase()
            );

            if (i < 0) {
                rows.push(record);
            } else {
                rows[i] = record;
            }

            localStorage.setItem(
                key, JSON.stringify(rows)
            );
        },

        async remove(email) {
            check();

            localStorage.setItem(
                key,
                JSON.stringify(
                    (await this.load()).filter(
                        r => r.email.toLowerCase() !==
                             email.toLowerCase()
                    )
                )
            );
        }
    };
})();
