import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import _ from "underscore";
import { getSelectedLanguages } from "../language/languageSlice";

export const chartSlice = createSlice({
  name: "chart",
  initialState: {
    data: [],
    date: "2019-04-11"
  },
  reducers: {
    add: (state, action) => {
      state.data = action.payload;
    }
  }
});

export const { increment, decrement, add } = chartSlice.actions;

export const fetchChartData = language => {
  return dispatch => {
    fetch(`http://localhost:5000/websites?tags=${language}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(res => res.json())
      .then(websites => {
        dispatch(add(websites));
      });
  };
};

export const selectData = state => state.chart.data;

/**
 * Group total websites views by language.
 *
 * @param data Array<{
 *  tags: <{name: string}>;
 *  url: string;
 *  website_views: Array<{ date: string, count: number}>
 * }>
 * @param languages Array<{name: string, displayed: bool}>
 *
 * Return: { language: string, views: number }
 */
export const groupByLanguage = createSelector(
  [selectData, getSelectedLanguages],
  (data, languages) => {
    // TODO: Implement
    //for every language
      //find all websites with that language
      //add found websites' counts to language sum
    var results = _.map(languages, language=>{
        // in here, we are working on a single language
        var sites_with_this_lang = _.filter(data, site=>{
            //get list of tag names for site
            var site_tag_names = _.map(site.tags, tag=>tag.name);
            return _.contains(site_tag_names, language.name);
          }
        );
        //get sum of views for every relevant site 
        //returns a list of counts
        var site_sums = _.map(sites_with_this_lang, site=>{
            var site_sum_obj = _.reduce(site.website_views, (memo, view)=>{
              return {count: parseInt(memo.count) + parseInt(view.count)};
              }, {count:'0'}
            );
            //should return sum of all daily views
            return site_sum_obj.count;            
          }
        );
        //get sum across sites for this lang
        var total_views = _.reduce(site_sums, (memo, n)=>{
            return memo + n;
          }, 0
        );
        //should return number of total views in this language
        var r = {language: language.name, 
                 views: total_views };
        return r
      }
    );//end map
    return results;
  }
);

/**
 * Flattened list of daily views.
 *
 * @param data Array<{
 *  tags: <{name: string}>;
 *  url: string;
 *  website_views: Array<{ date: string, count: number}>
 * }>
 * @param languages Array<{name: string, displayed: bool}>
 *
 *
 * Return: Array<{
 *    count: number;
 *    date: string;
 *    website: string;
 * }>
 */
export const flattenWebsiteViews = createSelector(
  [selectData, getSelectedLanguages],
  (data, languages) => {
    return _.flatten(
      data
        .filter(
          website =>
            website.tags.filter(tag =>
              languages.map(lang => lang.name).includes(tag.name)
            ).length > 0
        )
        .map(website =>
          website.website_views.map(views => {
            return {
              count: views.count,
              date: views.date,
              website: website.url
            };
          })
        )
    );
  }
);

export default chartSlice.reducer;
