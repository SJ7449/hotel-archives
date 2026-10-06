App.stub('shop', 'Shop', 3, () => (App.data.shops.daily?.length || 0) + (App.data.shops.featured?.length || 0), 'The current daily and featured shop will appear here, driven by data/shops.json.');
App.stub('legacy-shop', 'Legacy Shop', 3, () => App.data.legacy.length, 'Chronological archive of past shops with date selection and comparison, driven by data/legacy-shops.json.');
