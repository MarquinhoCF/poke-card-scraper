docker build -t data-cleaning-server-python3.12 .

docker run -it -p 5001:5001 -v /../scrape/dirty_data:/app/../dirty_data --name poke-card-data-cleaning data-cleaning-server-python3.12

docker exec -it poke-card-data-cleaning bash

docker stop poke-card-data-cleaning

Listagem de container em execução
docker ps

Remove container
docker rm <NAMES>

Listagem de imagens
docker images

Remove imagem e os containeres forçadamente
docker rmi <IMAGE-ID> -f