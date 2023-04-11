class CountedIdSemophor
{
    constructor()
    {
        this.callees = [];
    }

    /**
     * Lock the lock
     * @param {String} [id] Use specific id. If not specified, use callee
     * @returns {boolean} Was lock successful?
     */
    lock(id)
    {
        id = id === undefined ? this.callee : id;
        if(this.callees.indexOf(id) === -1)
        {
            this.callees.push(id);
        }
        return true;
    }

    /**
     * Unlock the lock
     * @param {String} [id]  Use specific id. If not specified, use callee
     * @returns {boolean} Was unlock successful?
     */
    unlock(id)
    {
        id = id === undefined ? this.callee : id;
        const idx = this.callees.indexOf(id);
        if(idx === -1)
        {
            return false;
        }
        else
        {
            this.callees.splice(idx,1);
            return true;
        }
    }

    /**
     * Force unlock the lock
     * @returns {boolean}
     */
    unlockForce()
    {
        this.callees = [];
        return true;
    }

    /**
     * @returns {boolean} Is semophor unlocked?
     */
    get unlocked()
    {
        return this.callees.length === 0;
    }
    /**
     * Not set.
     */
    set unlocked(_)
    {}

    /**
     * @returns {boolean} Is semophor locked?
     */
    get locked()
    {
        return this.callees.length > 0;
    }
    /**
     * Not set.
     */
    set locked(_)
    {}

}