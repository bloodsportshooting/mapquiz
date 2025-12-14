const routes = {
  Home: '/',
  Quiz: '/quiz',
  CreateQuiz: '/create-quiz',
};

export function createPageUrl(page) {
  return routes[page] || '/';
}

export function isPointInPolygon(point, vertices = []) {
  if (!vertices?.length || vertices.length < 3) return false;

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersects =
      (yi > point.y) !== (yj > point.y) &&
      point.x <
        ((xj - xi) * (point.y - yi)) / ((yj - yi) || Number.EPSILON) +
          xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

export function getPolygonCentroid(vertices = []) {
  if (!vertices?.length) return null;
  const { x, y } = vertices.reduce(
    (acc, vertex) => ({
      x: acc.x + vertex.x,
      y: acc.y + vertex.y
    }),
    { x: 0, y: 0 }
  );

  return {
    x: x / vertices.length,
    y: y / vertices.length
  };
}


