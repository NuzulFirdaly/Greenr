# Table of Contents
1. Welcome to to GreenR
2. How to use our app
3. Features
# 1. Welcome to GreenR

>Introduction about Greenr

# 2. How to use our app
## Pre-requisites

- Familiarity with environment variables, MySQL, Docker container local hosting or cloud hosting

## Basic Set-Up

1. Clone the repository
2. Go to terminal, and type ``` npm install```
4. Create and host a MySQL server
5. Create and name a database in MySQL
6. Create a new connection (with password) to the server and allow access to the newly created database
7. Follow the next steps below
8. Once you have hosted the containers, created a MySQL server and configured the environment variables. Go to terminal and run ```nodemon```

## Deploy and configure AI Model Containers

Due to the nature of AI libraries, we have utilized docker containers to make deployment and usage of our AI models easier. Our docker containers are configured to run uwsgi-nginx-flask at startup. For more information on uwsgi-nginx-flask please refer [here](https://hub.docker.com/r/tiangolo/uwsgi-nginx-flask/). 

As we come to an end to the project, we will be retiring our hosted container services due to cost concern. To test our application you may have to deploy the docker containers in the cloud. AWS, GCP and Azure provides container hosting services, and they offer free credits for new users. Do utilize them.

The following are our docker images that we have published on docker hub categorized by members :

Nuzul
- [Aspect Extraction Model Service](https://hub.docker.com/repository/docker/nuzulfirdaly/aspect-extract) -> When pullling this docker image, please specify the **:fixed** tag

- [Aspect Based Sentiment Analysis Model Service]()

- [Recommendation System Service]() -> When pulling this docker image, you will have to configure the environment variable to allow it to access the MySQL server 
## Change Environment Variable

After deploying the containers above, you will have to create a .env file in the project folder and add the following environment variables

```
db_host = "ip address of mysql server"
db_database = "database name"
db_username =  "user connection name"
db_password = "password for the user connection"
aspect_extract_service_address = "address to the aspect extraction service"
absa_service_address = "address to the absa service"
recommendation_system_address = "address to the recommendation service"

```
>when assigning the values in the variables, do not include the double quotations.


# 3. Features
##  Nuzul

> AI Features
### **Aspect Extraction (AE)**
- Utilized a pretrained BERT model on NER task to extract aspects in IOB format. 
- Fine-tuned the model on [SemEval 2016 laptop reviews dataset](http://metashare.ilsp.gr:8080/repository/browse/semeval-2016-absa-laptop-reviews-english-train-data-subtask-1/0ec1d3b0563211e58a25842b2b6a04d77d2f0983ccfa4936a25ddb821d46e220/)

- Then used  **RPA** to scrape reviews from [consumer affairs](https://www.consumeraffairs.com/homeowners/lg_refrigerator.html), annotated them on **LabelStudio** and fine-tuned the model further for fridge domain.
 The model returns an **IOB** formatted output. ![](/readME_Images/AE%20Training.jpg)


### **Aspect Based Sentiment Analysis (ABSA)**
- Utilized [ABSA library](https://github.com/ScalaConsultants/Aspect-Based-Sentiment-Analysis) that takes a text and aspects as input and classify sentiments based in relation to its aspect. ![](/readME_Images/ABSA_library.jpg)


### **AE + ABSA = Better review consolidation**
- With both models combined, we will have a better consolidation of all reviews about a fridge. ![](/readME_Images/absa.jpg)
### **Recommendation system**
- Utilized [Sentence-Transformers](https://huggingface.co/sentence-transformers) as a content based recomnmendation system. 
- Generate embeddings for a description of a currently viewed fridge and compares it to all the other embeddings of different product description. Utilized cosine similarity to compute similarity score


> Other notable features
- User Authentication with passport
- Add to cart | Orders | Buy
- Buyer -> Seller Onboarding
- Product listing |  Sell
- Payment with Paypal
-  Intellitick Chatbot


