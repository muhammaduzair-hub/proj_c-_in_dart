class Salesman
{
    /**
     * 
     * @param {Array<Array<Vector>>} pointsSets
     * @param {Vector} [startPoint] Start from this point (if not given, start from first point in coordinates)
     */
    constructor(pointsSets, startPoint)
    {
        this.pointsSets = pointsSets;
        this.startPoint = startPoint;
    }

    /**
     * Nearest Neighbor Solution
     * @returns {Array<Array<Number>>} Sorted index array as [setIndex,pointIndex]
     */
    NearestNeighbor()
    {
        // Make local copy of points that we can mutate
        const localSets = this.pointsSets.copy().map((s,i)=>[i,s]);

        let nowPoint;
        const sortedIndices = [];
        if(!this.startPoint)
        {
            // Put first point into sortedIndices
            nowPoint = localSets.shift()[1][0];
            sortedIndices.push([0,0]);
        }
        else
        {
            nowPoint = this.startPoint;
        }
        
        while(localSets.length > 0)
        {
            let closestSetIndex;
            let closestPointIndex;
            let closestLocalSetIndex;
            let closestDistance = Infinity;
            localSets.forEach((s,k)=>{
                s[1].forEach((p,i)=>{
                    const dist = nowPoint.dist_to_point(p);
                    if(dist < closestDistance)
                    {
                        closestDistance = dist;
                        closestSetIndex = s[0];
                        closestPointIndex = i;
                        closestLocalSetIndex = k;
                    }
                });
            });
            sortedIndices.push([closestSetIndex,closestPointIndex]);
            localSets.splice(closestLocalSetIndex,1);
        }

        return sortedIndices;
    }

    static test()
    {
        return new Salesman(Salesman.__make_test_coords()).NearestNeighbor();
    }

    static __make_test_coords()
    {
        const testCoords = [];
        for(i = 0; i < 100; i++){testCoords.push([1,2,3,4].map(q=>new Vector(Math.random(),Math.random())))};
        return testCoords;
    }
}