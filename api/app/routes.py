import json
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from .flask import app
from models import Website, db, Tag

@app.route("/website", methods=["POST"])
def create_website():
    """
    Creates a website from the POST data.
    Returns:
        The created website.
    """
    website_data = request.json
    url = request.form.get("url")
    tag_ids = request.args.get("tags", [])
    tags = db.session.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    website = Website(url=url, tags=tags)
    db.session.add(website)
    db.session.commit()
    return jsonify(website)

@app.route("/website/<id>")
def get_website(id):
    """
    Retrieves a website.
    Args:
        id: The id for a website.
    Returns:
        The website.
    """
    return jsonify(Website.query.get(id))

@app.route("/websites")
def list_website():
    """
    Get all websites filtered by the query params.
    Params:
        tags: comma separated list of tag names to filter websites by.
    Returns:
        All filtered websites.
    """
    # get tag names
    tag_names = request.args.get("tags", None)
    if not tag_names: return jsonify({})
    if ',' in tag_names:
      tag_names = tag_names.split(',')
    else:
      tag_names = [tag_names]
    # get Tag objects by names
    tags = Tag.query.filter(Tag.name.in_(tag_names)).all()
    db.session.commit()
    # get website id from tag id in website_to_tags
    all_sites = []
    for tag in tags:
      tagged_sites = Website.query.filter(Website.tags.any(name=tag.name)).all()
      all_sites += tagged_sites
    return jsonify(all_sites)

@app.route("/tag", methods=["POST"])
def create_tag():
    """
    Creates a tag from the POST data.

    Returns:
        The created tag.
    """
    tag_name = request.form.to_dict().get('name', None)
    if not tag_name:
      return jsonify({})
    # build tag
    tag = Tag(name = tag_name)
    db.session.add(tag)
    db.session.commit()
    return jsonify(tag)

@app.route("/tag/<id>")
def get_tag(id):
    """
    Retrieves a tag.
    Args:
        id: The id for the tag.
    Returns:
        The tag.
    """
    #TODO: revise to avoid use of in_ for single item
    tag = db.session.query(Tag).filter(Tag.id.in_(id)).all()
    return jsonify(tag)

@app.route("/tags")
def list_tags():
    """
    Get all tags.

    Returns:
        All tags.
    """    
    return jsonify(db.session.query(Tag).all())

# for debug purposes only
@app.route("/listsites")
def list_websites():
    """
    Get 2 websites.

    Returns:
        2 websites.
    """    
    sites = list(db.session.query(Website).all())
    return jsonify(Website.query.limit(2).all())

@app.route("/website/<website_id>/tag/<tag_id>", methods=["PUT"])
def add_tag_to_website(website_id, tag_id):
    """
    Associates a tag with a website.
    Args:
        website_id: The website to add the tag to.
        tag_id: The tag to be added to the website
    Returns:
        The updated website.
    """
    # get Website using website id
    site = db.session.query(Website).filter(Website.id == website_id).first()
    # get Tag using tag id
    tag = db.session.query(Tag).filter(Tag.id == tag_id).first()
    # Add tag to website
    site.tags.append(tag)
    db.session.commit()
    # return website
    return jsonify(site)

@app.route("/health")
def health():
    return "OK"
