# Mona-backend

## Intro
Backend offrant des routes permettant de gérer des musées et leurs expositions. Il est composé d'un seul microservice et est designé pour être utilisé par un backoffice et plusieurs frontends (app, webapp). La base de données utilisée est MongoDB, pour des raisons que nous verrons plus tard.   L'environnement de développement est donc composé de deux images Docker: une pour la base de données, une pour le microservice, le tout étant regroupé facilement avec docker compose.   
Un simple `docker-compose up` permet donc de lancer le projet.

Le microservice est déployé sur AWS, l'url de base est: https://wwdtrf36ka.execute-api.us-east-1.amazonaws.com/dev  
La base de données est hébergée sur MongoDB Atlas.


## Routes
| Type  | Route  | Params  | Description  |
|---|---|---|---|
| POST  | /museums  | title: String  | Creates museum with title  |
| GET | /museums  | None  | Gets all museums  |
| POST  |  /exhibitions | museumId: Int <br/> title: String  | Creates exhibition associated with museum |
| PATCH  |  /exhibitions | museumId: Int <br/> exhibition : Exhibition  | Updates exhibtion |
| GET  |  /exhibitions | museumId: Int  | Gets all exhibitions of a museum  |

### Models
 
```
Artwork = {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: [true, 'Artwork title is required']
    },
    description: String,
    audioFileUrl: String,
    imageUrl: String,
    rating: ratingSubSchema
}
```
```
Exhibition = {
    title: {
        type: String,
        required: [true, "Title is missing"]
    },
    description: String,
    imageUrl: String,
    rates: [
        {
            price: {
                type: Number,
                min: [0, 'Price cannot be negative']
            },
            category: {
                type: String,
                //TODO Remplacer par un objet à part entière
                enum: ['Student', 'Standard', 'Child']
            },
            iconUrl: String
        }
    ],
    openingDate: {
        startDate: Date,
        finishDate: Date,
        openingDays: [Number]
    },
    artworks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Artwork'
        }
    ],
    rating: ratingSubSchema
}
```
```
Museum = {
    title: {
        type: String,
        required: [true, 'Title is missing']
    },
    location: {
        address: String,
        lat: Number,
        lon: Number
    },
    exhibitions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Exhibition'
        }
    ]
}
```

## Archtitecture voulue
API Gateway (Authentification) -> Microservice <--> Database

## Discussion
### Architecture globale
Il devrait théoriquement y avoir au moins 2 microservices: un pour l'authentification, un pour le backend.   
Dans l'implémentation actuelle il y a seulement le backend. C'est pour cette raison que le champ `museumId` est parfois demandé. Ce champ doit normalement être compris dans le token d'authentification, et permettre d'identifier le musée en question. Autrement, n'importe qui possédant l'`id` du musée pourrait supprimer, modifier ses expositions associées.  
L'achitecture actuelle est donc particulièrement simple mais aussi très modulable, rajouter d'autres microservices peut se faire facilement.

### Base de données
Le choix de la base de données s'est fait assez rapidement: ce backend servant à celui d'un POC d'une startup, il devait être facilement modulable et intégrable. MongoDB possèdes ces deux aspects; c'est une BDD facile à mettre en place, et il est facile d'itérer sur plusieurs schémas différents sans avoir de problèmes de compatibilité. C'est donc l'option qui semblait évidente, étant donné qu'en étant dans un stade très primaire les soucis d'optimisation et de performance ne sont pas prioritaires.  

Il y a trois models dans la base de données: Artwork, Exhibition et Museum.  
Un musée possède plusieurs expositions. Une exposition est obligatoirement liée à un musée, et possède plusieurs oeuvres.  
En suivant ces [indications](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1), j'ai déterminé que la relation Museum - Exhibition était "one-to-many", c'est-à-dire qu'un musée peut avoir des dizaines- centaines-milliers d'expositions mais il n'en aura jamais des millions. On peut donc garder l'`id` de chaque Exhibition dans un objet Museum.  
De la même manière, la relation Exhibition - Artwork est elle aussi "one-to-many". On garde donc en référence l'`id` de chaque Artwork dans un objet Exhibition. De plus, les oeuvres pouvant être gérées séparément d'une exposition, il est important de les garder à part.


### Architecture du microservice
Le processus de traitement des requêtes reçues est standardisé par un `pipe`, qui effectue toujours les mêmes opérations quelque soient les requêtes/réponses.  
La file est organisée comme ceci:  
1) Détermination du type de requête -> POST, PATCH ou GET  
2) Récupération des paramètres de la requête, en fonction de son type -> Body pour POST et PATCH, QueryParameters pour GET  
3) Si les paramètres sont `null`, ceux-ci sont remplacés par une empty String
4) Exécution de la fonction Lambda avec les paramètres récupérées  
  Cette fonction:  
    - reçoit les paramètres de la requête
    - récupère les arguments nécessaires parmis les paramètres
    - effectue une tâche (généralement accès à la base de données)
    - renvoie une Promise, qui elle renverra un objet du type   
    ```
    {
      statusCode: Int,
      body: Object
    }
    ```
5) JSONification du champ `body`  
6) Catch de la Promise retournée en 4) au cas où une exception arrive, et renvoi d'un objet avec une erreue 500
7) Renvoi de l'objet retourné en 4), si tout s'est bien passé



