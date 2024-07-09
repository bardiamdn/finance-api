# FINANCEAPI

Data types and required for the routes

----------------------------------
api/transactions: 

    userId          -> ObjectId + required
    space           -> String 
    account         -> String   + required
    date            -> Date     + required
    amount          -> Number   + required
    type            -> String   + required
    category        -> String   + required
    details         -> String   + required
    submitDateTime  -> Date     + required

----------------------------------
api/profile:

    userId          -> ObjectId     + required
    username        -> String
    profilePic      -> String       + default: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg stroke-width="1.25" viewBox="0 0 24 24" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path opacity="0.1" d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" fill="#4DACD1"/><path d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" stroke="#4DACD1"/><path d="M3 21c.957-3.076 3.42-4 9-4s8.043.924 9 4" stroke="#4DACD1" stroke-linecap="round"/></svg>'
    accounts {
        
        dateUpdated     -> Date
        accountTitle    -> String
        accountIco      -> String   + default: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg stroke-width="1.5" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style>.cls-fsg6jvkx0lamm5ymy2d3f-1,.cls-fsg6jvkx0lamm5ymy2d3f-2{fill:none;stroke:#4DACD1;stroke-miterlimit:10;;}.cls-fsg6jvkx0lamm5ymy2d3f-1{stroke-linecap:square}</style></defs><g id="money_1" data-name="money 1"><rect class="cls-fsg6jvkx0lamm5ymy2d3f-1" x="1.5" y="5.32" width="21" height="13.36"/><circle class="cls-fsg6jvkx0lamm5ymy2d3f-1" cx="12" cy="12" r="3.82"/><line class="cls-fsg6jvkx0lamm5ymy2d3f-2" x1="4.36" y1="9.14" x2="6.27" y2="9.14"/><line class="cls-fsg6jvkx0lamm5ymy2d3f-2" x1="17.73" y1="14.86" x2="19.64" y2="14.86"/><line class="cls-fsg6jvkx0lamm5ymy2d3f-2" x1="4.36" y1="9.14" x2="6.27" y2="9.14"/><line class="cls-fsg6jvkx0lamm5ymy2d3f-2" x1="17.73" y1="14.86" x2="19.64" y2="14.86"/></g></svg>'
        accountColor    -> String   + default: '#ffffff'  // set it to something better later
        accountBalance  -> String   // It is better to set it to string for negative balances
        listPriority    -> Number
        createdAt       -> Date
    }
    categories {

        dateUpdated     -> Date
        categoryTitle   -> String
        categoryIcon    -> String   + default: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg stroke-width="1.5" viewBox="0 0 24 24" stroke="#4DACD1" fill="none" stroke-linecap="round" stroke-linejoin="round" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.69 7.44A6.973 6.973 0 0 0 15 12a6.97 6.97 0 0 0 1.699 4.571m0-.004c1.914-.684 3.691-2.183 5.301-4.565-1.613-2.384-3.394-3.883-5.312-4.565"/><path d="M2 9.504a40.73 40.73 0 0 0 2.422 2.504A39.679 39.679 0 0 0 2 14.506"/><path d="M18 11v.01"/><path d="M4.422 12.005H15"/><path d="M7 10v4"/><path d="M11 8v8"/></svg>'
        categoryColor   -> String   + default: '#ffffff'  // set it to something better later
        categoryBalance -> String   // It is better to set it to string for negative balances
        listPriority    -> Number
        createdAt       -> Date
    }
    lastSignin      -> Date
    createdAt       -> Date

----------------------------------
api/space:

    userIds {
        userId      -> ObjectId + required
    }
    usernames {
        username    -> String+ required
    }
    spaceName       -> String + required
    spaceBalance    -> String
    admins {
        admin       -> ObjectId
    }