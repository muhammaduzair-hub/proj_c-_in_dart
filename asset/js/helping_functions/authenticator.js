/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class Authenticator
{
  constructor( length )
  {
    this.length = length;
    this.code = "";
  }

  async today()
  {
    let now = new Date();
    let d = new Date( Date.UTC( now.getFullYear(), now.getMonth(), now.getDate() ) );
    d.setTime( d.getTime() + d.getTimezoneOffset() * 60 * 1000 );
    return "" + d.getFullYear() + (d.getMonth() + 1) + d.getDate();
  }

  async generate_code()
  {
    let key = await this.today();
    let hash = await this.digestMessage( key );
    this.code = hash.substring( 0, this.length ).toUpperCase();
    return this.code;
  }

  async digestMessage( message )
  {
    const msgUint8 = new TextEncoder().encode( message ); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest( 'SHA-256', msgUint8 ); // hash the message
    const hashArray = Array.from( new Uint8Array( hashBuffer ) ); // convert buffer to byte array
    const hashHex = hashArray.map( b => b.toString( 16 ).padStart( 2, '0' ) ).join( '' ); // convert bytes to hex string
    return hashHex;
  }

}