function now() { return (new Date).getTime(); }

var TinyCache = function() {
    var self = this;
    self.cache = {};
    self.debug = false;
    self.hitCount = 0;
    self.missCount = 0;
    
    return self;
}

TinyCache.prototype.put = function( key, value, time ) {
    var self = this;

    if ( self.cache[ key ] )
    {
        clearTimeout( self.cache[ key ].timeout );
    }

    var expire = time + now();
    var record = {
        value: value,
        expire: expire
    };

    if ( !isNaN( expire ) )
    {
        ( function() {
            var _self = self;
            var timeout = setTimeout( function() {
                _self.del( key );
            }, time );
            record.timeout = timeout;
        } )();
    }

    self.cache[ key ] = record;
}

TinyCache.prototype.del = function(key) {
    var self = this;

    if ( self.cache[ key ] )
    {
        clearTimeout( self.cache[ key ].timeout );
    }

    delete self.cache[ key ];
}

TinyCache.prototype.clear = function() {
    var self = this;

    for( var key in self.cache ) {
        clearTimeout( self.cache[ key ].timeout );
    }
    
    self.cache = {};
}

TinyCache.prototype.get = function(key) {
    var self = this;
    var record = self.cache[ key ];
    if ( typeof record != "undefined" )
    {
        if ( isNaN( record.expire ) || record.expire >= now() )
        {
            self.debug && ++self.hitCount;
            return record.value;
        }
        else
        {
            self.debug && ++self.missCount;
            self.del( key );
        }
    }
    return null;
}

TinyCache.prototype.size = function() {
    var self = this;
    var size = 0, key;
    for ( key in self.cache ) {
        if ( self.cache.hasOwnProperty( key ) )
        {
            if ( self.get( key ) !== null )
            {
                size++;
            }
        }
    }
    return size;
}

TinyCache.prototype.memsize = function() {
    var self = this;
    var size = 0, key;
    for ( key in self.cache ) {
        if ( self.cache.hasOwnProperty( key ) )
        {
            size++;
        }
    }
    return size;
}

TinyCache.prototype.hits = function() {
    var self = this;
    return self.hitCount;
}

TinyCache.prototype.misses = function() {
    var self = this;
    return self.missCount;
}

TinyCache.shared = new TinyCache();

if ( typeof( module ) !== 'undefined' && typeof( module.exports ) !== 'undefined' )
{
    module.exports = TinyCache;
}
else
{
    if ( typeof( define ) === 'function' && define.amd )
    {
        define( [], function() {
            return TinyCache;
        } );
    }
    else
    {
        window.TinyCache = TinyCache;
    }
}
