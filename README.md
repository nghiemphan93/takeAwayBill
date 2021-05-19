# takeAwayBill
provide bills management services for the Goldene Drachen restaurant on takeaway.com

https://take-away-bill.web.app/

Deployment steps:
    frontend: 
        ng build --prod
        firebase deploy
    backend:
        git push heroku main
