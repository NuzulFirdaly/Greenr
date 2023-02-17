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
## Change Environment Variable & and other credentials

After deploying the containers above, you will have to create a .env file in the project folder and add the following environment variables
>when assigning the values in the variables, do not include the double quotations.
```
db_host = "ip address of mysql server"
db_database = "database name"
db_username =  "user connection name"
db_password = "password for the user connection"
aspect_extract_service_address = "address to the aspect extraction service"
absa_service_address = "address to the absa service"
recommendation_system_address = "address to the recommendation service"

```
>we might also be retiring our paypal sandbox and google auth credentials. Please generate new ones and update them in index.js for paypal credentials and  main.js for google api credentials

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

##  Saran

> AI Features
### **Speaker Recongition**

Used Siamese neural network for speaker recongition which is a type of deep learning architecture used to compare two inputs and predict if they are similar or not.
I have trained the model using 50 audio files whhich are sampled to 16000hz and 1 second from 5 different speaker.

- At registration page, users have to give two audio files which will be used train the model. One of the audio files will be saved into the database.

 The python code used for training the model. ![](/readME_Images/image.png)
 
 - At the TWO-FA page, user have to upload an audio file to verify. Using the model to predict whether the audio is similar to the audio file saved in the databse under the user.
 
  The python code used to predict two different audio. ![](/readME_Images/predict.png)
  
  
  > Other notable features
- User register their audio file
- users have to verify their email before login.
- users can reset their password if they forgot by using a link send to their email
- admin delete specific user (notification will be sent to the removed user).
- admin able to email specific user. 
- admin approving the sellers after requested by the buyer to be seller (notification will be send to the user) 
- admin can choose not to approve the user to be a seller ( notification send to the user). 
- all the email is done by using google api

  
 





##  Nigel
Image classification model to detect if its a Samsung fridge or LG fridge,
pre trained using vgg16
-webcam feature whereby users can turn it on to detect if it is a samsung fridge or lg fridge
-file upload feature whereby users can upload a picture of a fridge to detect if it is a samsung fridge or lg fridge
-after the model detects the brand of the fridge, it redirects to the product listing page.

