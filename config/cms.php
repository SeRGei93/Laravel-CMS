<?php

$cms = [
	'factory' => [
        'address',
        'answer',
        'block',
        'blog',
        'car',
        'category',
        'cinema',
        'comment',
        'factor',
        'field',
        'food',
        'foodprogram',
        'form',
        'gym',
        'gymaction',
        'gymprogram',
        'home',
        'hotel',
        'module',
        'movie',
        'music',
        'page',
        'permission',
        'product',
        'restaurant',
        'role',
        'shop',
        'showtime',
        'tag',
        'tagend',
        'travel',
        'tour',
        'user',
    ],
    'seeder' => [
        'address',
        'answer',
        'blog',
        'car',
        'category',
        'cinema',
        'factor',
        'field',
        'food',
        'food-program',
        'form',
        'gym',
        'gym-action',
        'gym-program',
        'home',
        'hotel',
        'movie',
        'music',
        'product',
        'restaurant',
        'shop',
        'showtime',
        'tag',
        'tagend',
        'travel',
        'tour',
    ],
    'permissions' => [
        'activity',
        'answer',
        'address',
        'block',
        'blog',
        'car',
        'category',
        'cinema',
        'comment',
        'factor',
        'field',
        'file',
        'follow',
        'food',
        'food-program',
        'form',
        'gym',
        'gym-action',
        'gym-program',
        'home',
        'hotel',
        'like',
        'module',
        'movie',
        'music',
        'notification',
        'page',
        'permission',
        'product',
        'rate',
        'report',
        'restaurant',
        'role',
        'setting-general',
        'setting-contact',
        'setting-developer',
        'shop',
        'showtime',
        'tag',
        'tagend',
        'tour',
        'travel',
        'user',
    ],
    'admin_tests' => [
        'address',
        'answer',
        'block',
        'blog',
        'car',
        'category',
        'cinema',
        'comment',
        'factor',
        'field',
        'food',
        'food-program',
        'form',
        'gym',
        'gym-action',
        'gym-program',
        'home',
        'hotel',
        'module',
        'movie',
        'music',
        'page',
        'permission',
        'product',
        'restaurant',
        'role',
        'shop',
        'showtime',
        'tag',
        'tagend',
        'tour',
        'travel',
        'user',
    ],
    'admin_routes' => [
        'activity',
        'address',
        'answer',
        'block',
        'blog',
        'car',
        'category',
        'cinema',
        'comment',
        'factor',
        'field',
        'file',
        'follow',
        'food',
        'food-program',
        'form',
        'gym',
        'gym-action',
        'gym-program',
        'home',
        'hotel',
        'like',
        'module',
        'movie',
        'music',
        'notification',
        'page',
        'permission',
        'product',
        'rate',
        'restaurant',
        'role',
        'shop',
        'showtime',
        'tag',
        'tagend',
        'tour',
        'travel',
        'user',
    ],
    'front_routes' => [
        'answer',
        'blog',
        'car',
        'cinema',
        'food',
        'food-program',
        'gym',
        'gym-action',
        'gym-program',
        'home',
        'hotel',
        'movie',
        'music',
        'product',
        'restaurant',
        'shop',
        'showtime',
        'travel',
        'tour',
    ],
];

$cms['social_companies'] = [
    'GOOGLE',
    'TWITTER',
    'FACEBOOK',
    'LINKEDIN',
    'GITHUB',
    'GITLAB',
    'BITBUCKET',
];

foreach($cms['social_companies'] as $social_company){
    $cms[strtolower($social_company)] = [
        'client_id' => env($social_company . '_CLIENT_ID'),
        'client_secret' => env($social_company . '_CLIENT_SECRET'),
        'redirect' => env($social_company . '_CLIENT_CALLBACK'),
    ];
}

return $cms;
