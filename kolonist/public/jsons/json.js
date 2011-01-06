// generalny status odpowiedzi
{
    "status": {
        "code": "OK",
        "message": "Błąd taki i owaki"
    },
    "content": "wszystko to co niżej zostało opisane"
}

// // informacje o prowincji
// przekazuje parametr id (id prowincji, której info chce pobrać)
{
    "id": 123,
    "name": "Nazwa prowincji",  // Gracz, który zdobył prowincję może zmienić jej nazwę (może to kosztować odpowiednią ilość dóbr), obecnie mało istotne
    "slots": [
        {
            "building": {
                "type": "stodola",
                "level": 4
            }
        },
        {
            "building": null    // info ze brak budynku
        },
        {
            //.....
        }
    ]
    "resources": {
        "wood": 123,
        "iron": 123
        // armia i osadnicy .........
    }
}

// pobranie info o budynkach do cache
[
    {
        "id": 123,
        "level": 123,
        "type": "stodola"
        // dalsze info, również o wymaganiach na dany posiom, nazwy budynków można pobrać ze statycznego pliku z nazwamy, wczytanego na początku
    }
]

// cykliczne informacje o stanie gry
{
    "provinces": [
        {
            "id": 123,
            "owner": {  // albo id usera i później w zapytaniu pobrać info o nim, albo tutaj (niestety mogą siępowtarzać, ale to nie jest jakiś duży koszt), gdy prowincja jest niezajęta to null
                "id": 123,
                "nickname": "ziomus"
            }
        }
        // .......
    ],
    "info": [   // informacje co się wydarzyło pomiędzy kolejnymi odświerzeniami gry (ktos został zaatakowany itd.
        {
            "code": "text",
            "title": "Wygrałeś bitwę",
            "message": "Wygrałeś bitwę z graczem Julek o provincję Cartagina",
            "date": "2010-11-14 10:47:32"   // data zajścia zdarzenia ( o ile aka będzie dostępna)
        },
        //.......
    ]
}

// myślę ze na razie to tyle. postarajmy się to zrobić, wartości w bazie można zasymulować
// jeszcze nie jest gotowa wygenerowana mapa, może we wtorek albo w poniedziałek po
// seminarium Bożenka to zrobi
// myśle, że możesz tez robić tego krona.
// jesli jakieś uwagi to pisz


