// Only enrich blank/new fields. Never overwrite a user's edited description, price or photo.
export function missingCatalogueFields(existing,record){
  const patch={};
  for(const key of ['category','district','environment','difficulty','latitude','longitude','activities','bestSeason','openingHours','sourceUrl']){
    const old=existing[key];if((old===undefined||old===null||old===''||old==='unknown'||(key==='category'&&old==='other'))&&record[key]!==undefined&&record[key]!==null&&record[key]!==''&&record[key]!==old)patch[key]=record[key];
  }
  if(!existing.imageUrl && record.imageUrl)for(const key of ['imageUrl','imageCredit','imageSource','imageLicense'])patch[key]=record[key];
  return patch;
}
