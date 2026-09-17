const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';
const GSU_SCHOOL_ID = 'U2Nob29sLTM2MA==';

const RMP_HEADERS = {
    'Content-Type': 'application/json',
    'origin': 'https://www.ratemyprofessors.com'
};

const SEARCH_TEACHERS_QUERY = `
    query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
        newSearch {
            teachers(query: $query) {
                edges {
                    node {
                        id
                        firstName
                        lastName
                        avgRating
                        numRatings
                    }
                }
            }
        }
    }
`;

const TEACHER_RATINGS_QUERY = `
    query TeacherRatingsPageQuery($id: ID!) {
        node(id: $id) {
            ... on Teacher {
                avgRating
                avgDifficulty
                numRatings
                wouldTakeAgainPercent
            }
        }
    }
`;

async function rmpGraphQLRequest(query, variables) {
    const response = await fetch(RMP_GRAPHQL_URL, {
        method: 'POST',
        headers: RMP_HEADERS,
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error(`RMP request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json?.data ?? null;
}

async function findTeacherId(lastName) {
    const data = await rmpGraphQLRequest(SEARCH_TEACHERS_QUERY, {
        query: { text: lastName, schoolID: GSU_SCHOOL_ID }
    });

    const edges = data?.newSearch?.teachers?.edges;
    if (!edges || edges.length === 0) {
        return null;
    }

    return edges[0]?.node?.id ?? null;
}

async function getTeacherRatings(teacherId) {
    const data = await rmpGraphQLRequest(TEACHER_RATINGS_QUERY, { id: teacherId });
    const teacher = data?.node;
    if (!teacher) {
        return null;
    }

    return {
        avgRating: teacher.avgRating ?? null,
        avgDifficulty: teacher.avgDifficulty ?? null,
        numRatings: teacher.numRatings ?? null,
        wouldTakeAgainPercent: teacher.wouldTakeAgainPercent ?? null
    };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const { instructorName, id } = message ?? {};

    if (!instructorName || typeof instructorName !== 'string' || instructorName.trim() === '') {
        sendResponse({ id, error: 'Missing or invalid instructor name' });
        return false;
    }

    (async () => {
        try {
            const teacherId = await findTeacherId(instructorName.trim());
            if (!teacherId) {
                sendResponse({ id, error: 'No matching professor found on RMP' });
                return;
            }

            const ratings = await getTeacherRatings(teacherId);
            if (!ratings) {
                sendResponse({ id, error: 'Could not fetch ratings for professor' });
                return;
            }

            sendResponse({ id, ...ratings });
        } catch (err) {
            console.error('RMP extension: request failed for', instructorName, err);
            sendResponse({ id, error: err?.message ?? 'Unknown error contacting RMP' });
        }
    })();

    return true;
});
