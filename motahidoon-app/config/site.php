<?php

/* إعدادات الواجهة العامة التي لا تُحرَّر من اللوحة. */
return [

    /* زرّ واتساب العائم في كلّ صفحات الموقع: يفتح محادثة مع الرقم ونصّ
       جاهز بلغة الصفحة. الرقم بالصيغة الدولية بلا «+» ولا مسافات (كما
       يطلبه wa.me). في النصّ «:org» يُستبدل باسم التجمّع بلغة الصفحة،
       فلا يتباعد الاسم عن المعتمد في المحتوى. */
    'whatsapp' => [
        'number' => env('WHATSAPP_NUMBER', '905530827711'),
        'text' => [
            'ar' => 'السلام عليكم ورحمة الله، أتواصل معكم من موقع :org، وأودّ الاستفسار عن: ',
            'en' => 'Hello, I am reaching out from the :org website and would like to ask about: ',
            'tr' => 'Merhaba, :org web sitesinden ulaşıyorum ve şu konuda bilgi almak istiyorum: ',
        ],
    ],
];
