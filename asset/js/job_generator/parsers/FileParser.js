class FileParser {
    constructor() {
        this.tasks = [];
        this.bb = [];
        this.src = undefined;
    }

    /**
     * 
     * @param {String} source 
     * @returns {FileParser} Parser
     */
    parseSync(source) {
        if(typeof(source) === 'string') {
            return this._parse(source);
        }else {
            console.error('Cannot read data source of type `' + typeof(source));
            return null;
        }
    };
    
    parseStream(stream, done) {
        var dataString = "";
    
        stream.on('data', onData);
        stream.on('end', onEnd);
        stream.on('error', onError);
    
        onData = (chunk) => {
            dataString += chunk;
        };
    
        onEnd = () => {
            try {
                var data = this._parse(dataString);
            }catch(err) {
                return done(err);
            }
            done(null, data);
        };
    
        onError = (err) => {
            done(err);
        };
    };

    /**
     * 
     * @param {String} datastring 
     * @returns {FileParser} Parser
     */
    _parse(datastring) {
        // Override
        console.warn("Using FileParser directly");
        this.src = datastring;
        return this;
    }

    refresh_bb()
    {
  
      var extent_corners = {
        min: [ Infinity, Infinity ],
        max: [ -Infinity, -Infinity ]
      };
      this.tasks.forEach( function( task )
      {
        let ec = task.bounding_box();
  
        if( ec.max[0] > extent_corners.max[0] )
          extent_corners.max[0] = ec.max[0];
        if( ec.max[1] > extent_corners.max[1] )
          extent_corners.max[1] = ec.max[1];
        if( ec.min[0] < extent_corners.min[0] )
          extent_corners.min[0] = ec.min[0];
        if( ec.min[1] < extent_corners.min[1] )
          extent_corners.min[1] = ec.min[1];
  
      } );
      this.bb = [ ];
      this.bb.push( new Vector( extent_corners.min[0], extent_corners.min[1] ) );
      this.bb.push( new Vector( extent_corners.min[0], extent_corners.max[1] ) );
      this.bb.push( new Vector( extent_corners.max[0], extent_corners.max[1] ) );
      this.bb.push( new Vector( extent_corners.max[0], extent_corners.min[1] ) );
    }

    copy() {
        const theCopy = new this.constructor();
        theCopy.tasks = this.tasks.copy();
        theCopy.bb = this.bb.copy();
        theCopy.src = this.src;
        return theCopy;
    }

};