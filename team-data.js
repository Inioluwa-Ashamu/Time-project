window.teamDirectoryConfig = {
    /*
    Choose one source type:
    - "local": use the fallback array in this file
    - "google-sheets-csv": fetch a published Google Sheet as CSV
    - "json": fetch a JSON endpoint such as SheetDB
    - "csv": fetch any public CSV endpoint

    Google Sheets setup:
    1. Create columns matching team-sheet-template.csv
    2. In Google Sheets, go to File -> Share -> Publish to web
    3. Publish the specific sheet tab as CSV
    4. Paste the spreadsheet ID below, plus the gid for the tab you published

    Example:
    source: {
        type: "google-sheets-csv",
        sheetId: "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
        gid: "0",
        sheetName: ""
    }

    Optional SheetDB-style JSON example:
    source: {
        type: "json",
        endpoint: "https://sheetdb.io/api/v1/your-endpoint-id"
    }
    */
    source: {
        type: "local",
        endpoint: "",
        sheetId: "",
        gid: "",
        sheetName: ""
    },
    fallback: [
        {
            name: "Tori",
            role: "Founder and Director",
            team: "office",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2025/04/Tori-photo.jpeg",
            bio: "Hi I'm Tori, Founder and Director of Time Specialist Support. My background is in Speech and Language Therapy and I first started learning about autism when I was studying at university. I soon became captivated by the autistic children I was meeting and have been ever since. Outside of work I enjoy singing, creative writing and learning to play the piano."
        },
        {
            name: "Ally",
            role: "Service Manager",
            team: "office",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2017/02/Ally-e1487589049713.jpg",
            bio: "I joined Time in July 2016 as the Service Manager. Every day is different, and I get to meet, talk to, and support lots of fabulous staff and families while trying to give the best service possible. In my spare time, I enjoy hiking in the Peak and Lake District, and travelling to Switzerland whenever I can."
        },
        {
            name: "Jack",
            role: "Recruitment Co-ordinator",
            team: "office",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2024/03/Jack.jpg",
            bio: "Hi, I'm Jack and I am the Recruitment Co-ordinator at Time Specialist Support. I have around two years of experience in recruitment and want to use what I know to make the Time support worker team even stronger. In my spare time, I enjoy going out and socialising with friends."
        },
        {
            name: "Richard",
            role: "Office Team",
            team: "office",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2024/03/Richard.jpg",
            bio: "Hi, I've been working for TSS for over 10 years. I started as a support worker while also working as a teaching assistant in a secondary school. Over the last couple of years, I have moved to working in the office full-time. When I am not working I love hiking, reading and playing board games."
        },
        {
            name: "Aabhya",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2025/06/Aabhya-Photo.jpg",
            bio: "My name is Aabhya. I've just completed my Psychology degree and I'm passionate about supporting neurodivergent individuals in ways that feel empowering, respectful, and fun. I love building genuine connections and creating space for people to express themselves comfortably."
        },
        {
            name: "Adela",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Adela-Schreuder-Obiols-scaled.jpeg",
            bio: "Hi, I'm Adela and I'm studying psychology at the University of Manchester. I'm really excited to work as a support worker because I'm passionate about autism and hope to put my degree towards a role that supports and advocates for autistic people."
        },
        {
            name: "Alicja",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Alicja-Rusniok.jpeg",
            bio: "Hi, I'm Alicja, a psychology student at the University of Manchester. I support autistic children and young people in a calm, understanding, and positive way. I'm especially passionate about creating safe, predictable spaces where people feel comfortable, respected, and supported to be themselves."
        },
        {
            name: "Amy",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Amy-Franklin-.jpeg",
            bio: "Hi, I'm Amy, and I'm currently studying Psychology at the University of Manchester. I'm working towards a career supporting vulnerable members of the community and chose Time to build positive, trusting relationships that bring joy, connection, and confidence into someone's day."
        },
        {
            name: "Anna D",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Anna-D.jpeg",
            bio: "Hi, my name is Anna and I am currently studying Psychology at the University of Manchester. Before moving to Manchester I lived in Guernsey where I volunteered in a disabled swim club. I am also learning British Sign Language alongside my studies."
        },
        {
            name: "Asiyah K",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Asiyah-K.jpeg",
            bio: "Hi, I'm Asiyah and I'm currently studying BSc Psychology at the University of Manchester. I'm hoping to go on and develop a career in child psychotherapy or clinical psychology, so being able to work at TSS is an incredible opportunity to meet new people, learn more about autism, and grow as a person."
        },
        {
            name: "Beatrice D",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Bea-D.jpeg",
            bio: "Hi, my name is Bea and I am currently undertaking a degree in BSc Psychology. My hobbies include reading, cooking, listening to music, animals, and swimming. I chose to work with Time to interact positively with my community and hopefully put a smile on people's faces."
        },
        {
            name: "Becky S",
            role: "Support Worker",
            team: "support",
            image_url: "https://time-specialist-support.com/wp-content/uploads/2026/02/Becky-S.jpeg",
            bio: "Hi, my name is Becky and I am studying Sociology and Social Anthropology at the University of Manchester. Supporting young autistic people is an incredibly rewarding and enjoyable job, and I love seeing the positive difference our support makes to young people and their families."
        }
    ]
};
