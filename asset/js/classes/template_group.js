/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global pt, translate */

class ShopFeatureGroup
{
  constructor( id, name, description = "", templates = [], owned = false, templategroup = false, price, currency, enabled = true, order = {}, metadata = [])
  {
    this.id = id;
    this._name = name;
    this.description = description;
    this.templates = templates;
    this.owned = owned;
    this.templategroup = templategroup;
    this.enabled = enabled;
    this.price = price;
    this._currency = currency;
    this.order = order;
    this.metadata = metadata;
  }

  copy()
  {
    return new ShopFeatureGroup(
      this.id,
      this.name,
      this.description,
      this.templates,
      this.owned,
      this.templategroup,
      this.price,
      this.currency,
      this.enabled,
      this.order,
      this.metadata
      );
  }

  set templategroup( v )
  {
    if( typeof (v) === "boolean" )
      this._templategroup = v;
    else
      throw "Property 'templategroup' must be boolean";
  }

  get templategroup()
  {
    return this._templategroup;
  }

  set owned( v )
  {
    if( typeof (v) === "boolean" )
      this._owned = v;
    else
      throw "Property 'owned' must be boolean";
  }

  get owned()
  {
    return this._owned;
  }

  set name( v )
  {
    this._name = v;
  }

  get name()
  {
    return translate[this._name] ? translate[this._name] : this._name;
  }

  get shown_templates_list()
  {
    return this.templates.filter( ( t ) => pt.list.indexOf( t ) > -1 );
//    return this.templates;
  }
  set shown_templates_list( v )
  {}

  has_shown_templates()
  {
    return this.shown_templates_list.length > 0;
  }

  get isPartiallyEnabled() {
    const filtered = this.shown_templates_list.filter(templateID => !settings_screeen_controller.hide.includes(templateID));

    if (filtered.length > 0 && filtered.length < this.shown_templates_list.length) {
      return true;
    }

    return false;
  }

  get isFullyEnabled() {
    const filtered = this.shown_templates_list.filter(templateID => !settings_screeen_controller.hide.includes(templateID));
    if (filtered.length === this.shown_templates_list.length) {
      return true;
    }
    return false;
  }

  get_metadata_for_feature(featureId)
  {
    const meta = this.metadata.find(d=>d.name === featureId)
    if(meta)
    {
      meta.metadata = meta.metadata.filter(d=>d.key !== null && d.value !== null && d.order !== null);
      meta.description = !!meta.description ? meta.description : null;
      return meta;
    }
    else
    {
      return {description: null, metadata: []};
    }
  }

  get shown_templates()
  {
    return this.shown_templates_list.map( ( t ) =>
    {
      const j = pt[t];
      const meta = this.get_metadata_for_feature(t);

      return {
        type: translate[j.template_type] ? translate[j.template_type] : j.template_type,
        title: translate[j.template_title] ? translate[j.template_title] : j.template_title,
        id: j.template_id,
        image: j.template_image,
        description: meta.description ? translate[meta.description] : meta.description,
        metadata: meta.metadata
      };
    } ).sort_objects( [ 'type', 'title' ] );
  }
  set shown_templates( v )
  {}

  get currency()
  {
    return this._currency;
  }
  set currency( v )
  {
    if( !v || v.length === 3 )
      return this._currency = v;
    else
      return false;
  }

  get decimal_price()
  {
    return this.price;

    switch( this.currency.toUpperCase() )
    {
      case "BIF":
      case "CLP":
      case "DJF":
      case "GNF":
      case "JPY":
      case "KMF":
      case "KRW":
      case "MGA":
      case "PYG":
      case "RWF":
      case "UGX":
      case "VND":
      case "VUV":
      case "XAF":
      case "XOF":
      case "XPF":
        return this.price;
        break;
      default:
        return this.price / 100.0;
    }
  }
}