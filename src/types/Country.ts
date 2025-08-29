//src\types\Country.ts
export interface Country {
  id?: string;
  name: string;
}

export interface CountryResponse {
  id: string;
  name: string;
  country_code?: string | null;

}

export interface GetCountyResponse {
  id: string;
  countryCode: string;
  countryName: string;
  //createdAt: string;
  //updatedAt: string;
}
  
  







