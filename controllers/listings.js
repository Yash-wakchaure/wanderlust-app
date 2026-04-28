const Listing = require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// const axios = require("axios");

const formatLocationLabel = (location = "") => {
    return location
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", ");
};

const getLocationGroupKey = (location = "") => {
    return formatLocationLabel(location).toLowerCase();
};

const buildPopularSections = (allListings) => {
    const groupedListings = new Map();

    for (const listing of allListings) {
        const locationName = formatLocationLabel(listing.location);
        const locationKey = getLocationGroupKey(listing.location);

        if (!locationName || !locationKey) continue;

        if (!groupedListings.has(locationKey)) {
            groupedListings.set(locationKey, {
                location: locationName,
                listings: [],
            });
        }

        groupedListings.get(locationKey).listings.push(listing);
    }

    return Array.from(groupedListings.values())
        .map(({ location, listings }) => ({
            location,
            listings: listings.slice(0, 8),
            totalListings: listings.length,
        }))
        .sort((a, b) => {
            if (b.totalListings !== a.totalListings) {
                return b.totalListings - a.totalListings;
            }

            return a.location.localeCompare(b.location);
        });
};


module.exports.index = async (req, res) =>{
    let allListings;
    let noResultsMessage = null;
    let popularSections = [];
    if (req.query.search) {
        const searchTerm = req.query.search;
        allListings = await Listing.find({
            $or: [
                { location: { $regex: searchTerm, $options: 'i' } },
                { country: { $regex: searchTerm, $options: 'i' } }
            ]
        });
        if (allListings.length === 0) {
            noResultsMessage = `No listings found for "${searchTerm}". The location you are searching for is not available.`;
        }
    } else {
        allListings = await Listing.find();
        popularSections = buildPopularSections(allListings);
    }
    return res.render("listings/index.ejs", {allListings, noResultsMessage, popularSections}); 
};

module.exports.renderNewForm = (req, res) =>{
    return res.render("listings/new.ejs");              
};

module.exports.showListing = async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
        return res.render("listings/show.ejs", {listing});
};

module.exports.selectCategory =  async(req, res, next) =>{
      try{
            const category = decodeURIComponent(req.params.category);
            const allListings = await Listing.find({category: {$regex: `^${category}$`, $options:"i"}});
            //    console.log(category);
            return res.render("listings/index", {allListings, category, noResultsMessage: null, popularSections: []});
      } catch(err){
            next(err);
      }  
}

module.exports.creatListing = async(req, res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);    
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    await newListing.save();
    req.flash("success", "New listing created!");
    return res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings"); 
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
    return res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

   if (req.file) { 
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
   }

  req.flash("success", "Listing updated");
  return res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) =>{
   let {id} = req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
    req.flash("success", "Listing deleted!");
    return res.redirect("/listings");
};
