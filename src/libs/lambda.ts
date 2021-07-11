export const JSON_BODY_MIDDLEWARE = (event) => {
  if (event.body){
    console.log("ENTRO");
    event.body = JSON.parse(event.body);
    console.log("ENTROTAMBIEN",event.body);
  }
}

